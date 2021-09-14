/**
 * Clamps a text node.
 * @param {HTMLElement} element. Element containing the text node to clamp.
 * @param {Object} options. Options to pass to the clamper.
 */

export interface ClampJsConfig {
    clamp?: number | 'auto';
    useNativeClamp?: boolean;
    splitOnChars?: string[];
    truncationChar?: string;
    truncationHTML?: string;
    callback?: (...args: unknown[]) => void;
    showReadMore?: boolean;
}

type FullyOptionalProps = 'truncationHTML' | 'callback' | 'showReadMore';

export class ClampJs {
    private readonly config: Required<Omit<ClampJsConfig, FullyOptionalProps>> &
        Pick<ClampJsConfig, FullyOptionalProps>;

    private readonly style: CSSStyleDeclaration;

    private readonly supportsNativeClamp: boolean;

    private readonly isCSSValue: boolean;

    private readonly truncationHTMLContainer?: HTMLElement;

    private readonly clampValue: 'auto' | number;

    private splitOnChars: string[];

    private splitChar?: string;

    private chunks?: string[];

    private lastChunk: unknown;

    private readonly element: HTMLElement;

    constructor(element: HTMLElement, options: ClampJsConfig) {
        this.element = element;
        this.config = {
            clamp: options.clamp || 2,
            useNativeClamp:
                typeof options.useNativeClamp != 'undefined' &&
                options.useNativeClamp
                    ? options.useNativeClamp
                    : true,
            splitOnChars: options.splitOnChars || ['.', '-', '–', '—', ' '], //Split on sentences (periods), hypens, en-dashes, em-dashes, and words (spaces).
            truncationChar: options.truncationChar || '…',
            truncationHTML: options.truncationHTML,
            callback: options.callback,
            showReadMore: options.showReadMore,
        };

        this.clampValue = this.config.clamp;
        this.style = element.style;
        this.supportsNativeClamp =
            typeof element.style.webkitLineClamp != 'undefined';
        this.isCSSValue =
            typeof this.config.clamp === 'string' &&
            (this.config.clamp.indexOf('px') > -1 ||
                this.config.clamp.indexOf('em') > -1);

        if (this.config.truncationHTML) {
            this.truncationHTMLContainer = document.createElement('span');
            this.truncationHTMLContainer.innerHTML = this.config.truncationHTML;
        }

        this.splitOnChars = this.config.splitOnChars.slice(0);
        this.splitChar = this.splitOnChars[0];

        if (this.clampValue == 'auto') {
            this.clampValue = this.getMaxLines();
        } else if (this.isCSSValue) {
            this.clampValue = this.getMaxLines(this.clampValue);
        }

        const height = this.getMaxHeight(this.clampValue);

        const isClamped = height <= element.clientHeight;

        if (this.supportsNativeClamp && this.config.useNativeClamp) {
            this.style.overflow = 'hidden';
            this.style.textOverflow = 'ellipsis';
            this.style.webkitBoxOrient = 'vertical';
            this.style.display = '-webkit-box';
            this.style.webkitLineClamp = this.clampValue.toString();

            if (this.isCSSValue) {
                this.style.height = this.config.clamp + 'px';
            }
        } else if (isClamped) {
            this.truncate(
                this.getLastChild(element, this.config.truncationChar),
                height
            );
        }

        if (isClamped) {
            this.addSeeMore(element, this.config.callback);
        }
    }

    private polyfillComputeStyle(el: any, pseudo: any): any {
        return {
            getPropertyValue: (prop: string) => {
                const re = /(\-([a-z]){1})/g;
                if (prop == 'float') prop = 'styleFloat';
                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }

                return 'currentStyle' in el ? el.currentStyle[prop] : null;
            },
        } as unknown as any;
    }

    private applyEllipsis(
        element: ChildNode,
        str: string,
        truncationChar?: string
    ) {
        element.nodeValue = str + truncationChar;
    }

    private addSeeMore(element: HTMLElement, callback?: () => void): void {
        const seeMore = document.createElement('div');
        seeMore.appendChild(document.createTextNode('See More'));

        seeMore.classList.add('link');

        seeMore.style.zIndex = 'auto';

        if (callback)
            seeMore.addEventListener('click', () => {
                callback();
            });

        element.parentElement?.appendChild(seeMore);
    }

    private computeStyle(element: HTMLElement, prop: string) {
        if (!window.getComputedStyle) {
            window.getComputedStyle = this.polyfillComputeStyle;
        }

        return window.getComputedStyle(element, null).getPropertyValue(prop);
    }

    private getLastChild(
        element: HTMLElement | null,
        truncationChar: string
    ): ChildNode | null {
        /*
         * Current element has children, need to go deeper and get last child as a text node
         *
         * Changed this to childNodes instead of children
         */
        if (element?.lastChild?.childNodes.length) {
            return this.getLastChild(
                Array.prototype.slice.call(element.children).pop(),
                truncationChar
            );
        }

        //This is the absolute last child, a text node, but something's wrong with it. Remove it and keep trying
        else if (
            element &&
            (!element.lastChild ||
                !element.lastChild.nodeValue ||
                element.lastChild.nodeValue == '' ||
                element.lastChild.nodeValue == truncationChar)
        ) {
            element.lastChild?.parentNode?.removeChild(element.lastChild);

            return this.getLastChild(element, truncationChar);
        } else {
            //This is the last child we want, return it
            return element?.lastChild ?? null;
        }
    }

    private getLineHeight() {
        let lh: string | number = this.computeStyle(
            this.element,
            'line-height'
        );
        if (lh == 'normal') {
            // Normal line heights vary from browser to browser. The spec recommends
            // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
            lh =
                parseInt(this.computeStyle(this.element, 'font-size'), 10) *
                1.2;
        }

        return parseInt(lh as string, 10);
    }

    private getMaxHeight(clamp: number): number {
        const lineHeight = this.getLineHeight();
        return lineHeight * clamp;
    }

    private getMaxLines(height?: number): number {
        const availHeight = height || this.element.clientHeight;
        const lineHeight = this.getLineHeight();

        return Math.max(Math.floor(availHeight / lineHeight), 0);
    }

    /**
     * Removes one character at a time from the text until its width or
     * height is beneath the passed-in max param.
     */
    private truncate(target: ChildNode | null, maxHeight: number): string {
        if (!maxHeight || !target) {
            return '';
        }

        const nodeValue = target?.nodeValue?.replace(
            this.config.truncationChar,
            ''
        );

        //Grab the next chunks
        if (!this.chunks) {
            //If there are more characters to try, grab the next one
            if (this.splitOnChars.length > 0) {
                this.splitChar = this.splitOnChars.shift();
            }
            //No characters to chunk by. Go character-by-character
            else {
                this.splitChar = '';
            }

            if (this.splitChar) {
                this.chunks = nodeValue?.split(this.splitChar);
            }
        }

        if (!this.chunks) {
            this.chunks = [];
        }

        //If there are chunks left to remove, remove the last one and see if
        // the nodeValue fits.
        if (this.chunks.length > 1) {
            // console.log('chunks', chunks);
            this.lastChunk = this.chunks.pop();
            // console.log('lastChunk', lastChunk);
            this.applyEllipsis(target, this.chunks.join(this.splitChar));
        }
        //No more chunks can be removed using this character
        else {
            this.chunks = undefined;
        }

        //Insert the custom HTML before the truncation character
        if (this.truncationHTMLContainer) {
            target.nodeValue =
                target.nodeValue?.replace(this.config.truncationChar, '') ?? '';
            this.element.innerHTML =
                target.nodeValue +
                ' ' +
                this.truncationHTMLContainer.innerHTML +
                this.config.truncationChar;
        }

        //Search produced valid chunks
        if (this.chunks) {
            //It fits
            if (this.element.clientHeight <= maxHeight) {
                //There's still more characters to try splitting on, not quite done yet
                if (this.splitOnChars.length >= 0 && this.splitChar != '') {
                    this.applyEllipsis(
                        target,
                        this.chunks.join(this.splitChar) +
                            this.splitChar +
                            this.lastChunk
                    );
                    this.chunks = undefined;
                }
                //Finished!
                else {
                    return this.element.innerHTML;
                }
            }
        }
        //No valid chunks produced
        else {
            //No valid chunks even when splitting by letter, time to move
            //on to the next node
            if (this.splitChar == '') {
                this.applyEllipsis(target, '');
                target = this.getLastChild(
                    this.element,
                    this.config.truncationChar
                );

                this.reset(this.splitOnChars);
            }
        }

        //If you get here it means still too big, let's keep truncating
        return this.truncate(target, maxHeight);
    }

    private reset(splitOnChars: string[]) {
        this.splitOnChars = this.config.splitOnChars.slice(0);
        this.splitChar = splitOnChars[0];
        this.chunks = undefined;
        this.lastChunk = undefined;
    }
}
