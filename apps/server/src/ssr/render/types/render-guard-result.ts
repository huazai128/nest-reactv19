export type RenderGuardResult =
  | { allow: true }
  | {
      allow: false;
      status: number;
      /** HTML 或纯文本 */
      body: string;
      contentType?: string;
    };
