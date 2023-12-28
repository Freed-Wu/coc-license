import {
  CompleteResult,
  ExtensionContext,
  listManager,
  sources,
  workspace,
} from "coc.nvim";
import LicenseList from "./lists";
import licenses from "@ovyerus/licenses";

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    listManager.registerList(new LicenseList(workspace.nvim)),

    sources.createSource({
      name: "license",
      doComplete: async () => {
        const items = await getCompletionItems();
        return items;
      },
    }),
  );
}

async function getCompletionItems(): Promise<CompleteResult> {
  return {
    items: Object.entries(licenses).map((v) => {
      const name = v[0];
      return { word: name };
    }),
  };
}
