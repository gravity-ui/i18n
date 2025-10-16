export interface GenerateId {
    (props: {filename: string; currentIdValue: string; hasId: boolean}): string;
}
