declare module 'citeproc' {
  const CSL: {
    Engine: new (
      sys: { retrieveItem(id: string): Record<string, unknown>; retrieveLocale(lang: string): string | undefined },
      style: string,
      lang: string,
      forceLang: boolean,
    ) => {
      setOutputFormat(format: string): void;
      rebuildProcessorState(
        citations: { citationID: string; citationItems: { id: string; locator?: string; label?: string }[]; properties: { noteIndex: number } }[],
        format: string,
        uncited: string[],
      ): [string, number, string][];
      makeBibliography(): false | [{ entry_ids: string[][]; hangingindent: boolean }, string[]];
    };
  };
  export default CSL;
}
