import { BasicList, ListAction, ListItem, Neovim, window } from "coc.nvim";
import getLicense from "license";
// https://github.com/Ovyerus/license/issues/14
import { sync as parseGitConfig } from "parse-git-config";
import gitPath from "git-config-path";
import fs from "fs";
import licenses from "@ovyerus/licenses";
import colors from "colors/safe";
// https://github.com/sindresorhus/open/issues/330
import exec from "child_process";
import os from "os";

export default class LicenseList extends BasicList {
  public readonly name = "licenses";
  public readonly description = "create LICENSE";
  public readonly defaultAction = "open";
  public actions: ListAction[] = [];

  constructor(nvim: Neovim) {
    super(nvim);
    const gitConfig = () =>
      parseGitConfig({ cwd: "/", path: gitPath("global") });
    const username = gitConfig().user?.name || process.env.USER;
    const email = gitConfig().user?.email || process.env.EMAIL;

    this.addAction("create", (item: ListItem) => {
      fs.writeFileSync(
        "LICENSE",
        `${getLicense(item.data.word, { author: username, email: email })}`,
      );
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
