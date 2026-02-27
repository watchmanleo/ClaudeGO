import _ from "../../web_modules/pkg/lodash.js";
import {Terminal} from "../../web_modules/pkg/xterm.js";
import {FitAddon} from "../../web_modules/pkg/xterm-addon-fit.js";
import {ImageAddon} from "../../web_modules/pkg/xterm-addon-image.js";
import {WebLinksAddon} from "../../web_modules/pkg/xterm-addon-web-links.js";
import {terminal as termElement} from "./disconnect/elements.js";
import {configureTerm} from "./term/confiruragtion.js";
import {loadOptions} from "./term/load.js";
export class Term extends Terminal {
  constructor(socket) {
    super({allowProposedApi: true});
    this.socket = socket;
    this.fitAddon = new FitAddon();
    this.loadAddon(this.fitAddon);
    this.loadAddon(new WebLinksAddon());
    this.loadAddon(new ImageAddon());
    this.loadOptions = loadOptions;
  }
  resizeTerm() {
    this.refresh(0, this.rows - 1);
    if (this.shouldFitTerm)
      this.fitAddon.fit();
    this.socket.emit("resize", {cols: this.cols, rows: this.rows});
  }
  get shouldFitTerm() {
    return this.loadOptions().wettyFitTerminal ?? true;
  }
}
export function terminal(socket) {
  const term = new Term(socket);
  if (_.isNull(termElement))
    return void 0;
  termElement.innerHTML = "";
  term.open(termElement);
  configureTerm(term);
  window.onresize = function onResize() {
    term.resizeTerm();
  };
  window.wetty_term = term;
  return term;
}
