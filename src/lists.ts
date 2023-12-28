import { BasicList, ListAction, ListItem, Neovim, window } from "coc.nvim";
import getLicense from "license";
import fs from "node:fs";
import licenses from "@ovyerus/licenses";
import colors from "colors/safe";
// https://github.com/sindresorhus/open/issues/330
import exec from "node:child_process";
import os from "node:os";

export default class LicenseList extends BasicList {
  public readonly name = "licenses";
  public readonly description = "create LICENSE";
  public readonly defaultAction = "open";
  public actions: ListAction[] = [];

  constructor(nvim: Neovim) {
    super(nvim);

    this.addAction("create", (item: ListItem) => {
      let status = "succeed";
      fs.writeFile("LICENSE", `${getLicense(item.data.name)}`, (err) => {
        if (err) status = "failed";
        window.showMessage(`${item.data.word} LICENSE ${status} to create!`);
      });
    });

    this.addAction("url-open", (item: ListItem) => {
      let status = "succeed";
      let command;
      switch (os.platform()) {
        case "darwin":
          command = "open";
          break;
        case "win32":
          command = "start";
          break;
        default:
          command = "xdg-open";
      }
      exec.exec(`${command} ${item.data.url}`, (error) => {
        if (error) status = "failed";
        window.showMessage(`${status} to ${command} ${item.data.url}`);
      });
    });
  }

  public async loadItems(): Promise<ListItem[]> {
    return Object.entries(licenses).map((v) => {
      const name = v[0];
      const license = v[1];
      return {
        label: `${name}: ${
          license.osiApproved
            ? colors.green(license.name)
            : colors.red(license.name)
        }\t\t${license.url}`,
        data: { word: name, ...license },
      };
    });
  }
}
