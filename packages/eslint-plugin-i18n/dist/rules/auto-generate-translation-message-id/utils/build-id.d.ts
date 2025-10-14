type BuildId = {
    (props: {
        uuid?: string;
        namespace?: string;
        translationObjectKey?: string;
    }): string;
};
export declare const buildId: BuildId;
export {};
