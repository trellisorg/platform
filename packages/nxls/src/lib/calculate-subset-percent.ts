import { Dependencies } from './types';
import { percentSubSet } from './util';

export function calculateSubsetPercent(
    dependencies: Dependencies,
    threshold: number
): {
    outerDep: string;
    innerDep: string;
    percent: number;
}[] {
    const deps: Record<string, string[]> = Object.entries(dependencies).reduce(
        (prev, [depName, depArray]) => ({
            ...prev,
            [depName]: depArray.map((dep) => dep.target),
        }),
        {}
    );

    const subsetPercents: {
        outerDep: string;
        innerDep: string;
        percent: number;
    }[] = [];

    const depKeys: string[] = Object.keys(deps);

    depKeys.forEach((outerKey) => {
        depKeys.forEach((innerKey) => {
            if (
                deps[outerKey].length > deps[innerKey].length &&
                outerKey !== innerKey
            ) {
                const record = {
                    outerDep: outerKey,
                    innerDep: innerKey,
                    percent: percentSubSet(deps[outerKey], deps[innerKey]),
                };
                if (record.percent > threshold) {
                    subsetPercents.push(record);

                    console.log(
                        `${outerKey} shares ${
                            Math.round(record.percent * 100 * 100) / 100
                        }% of it's deps with ${innerKey}`
                    );
                }
            }
        });
    });

    return subsetPercents;
}
