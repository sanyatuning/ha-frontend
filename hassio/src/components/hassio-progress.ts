import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  css,
  CSSResult,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";
import { SubscribeMixin } from "../../../src/mixins/subscribe-mixin";
import { HomeAssistant } from "../../../src/types";
import "@material/mwc-linear-progress/mwc-linear-progress";

interface SupervisorEvent {
  data: {
    event: string;
    name: string;
    state: {
      progress: number;
      buffer: number | null;
    };
  };
}

@customElement("hassio-progress")
export class HassioProgress extends SubscribeMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public name = "";

  @internalProperty() private buffer = 0;

  @internalProperty() private progress = 1;

  protected render(): TemplateResult {
    if (this.progress === 1) {
      return html``;
    }
    if (this.progress === 0 && this.buffer === 0) {
      return html` <mwc-linear-progress indeterminate></mwc-linear-progress> `;
    }
    return html`
      <mwc-linear-progress
        .progress=${this.progress}
        .buffer=${this.buffer}
      ></mwc-linear-progress>
    `;
  }

  public hassSubscribe(): Promise<UnsubscribeFunc>[] {
    return [
      this.hass.connection.subscribeEvents(this._update, "supervisor_event"),
    ];
  }

  private _update = (ev: SupervisorEvent) => {
    if (ev.data.event === "job_progress" && ev.data.name === this.name) {
      this.buffer = ev.data.state.buffer || 0;
      this.progress = ev.data.state.progress || 0;
    }
  };

  static get styles(): CSSResult[] {
    return [
      css`
        mwc-linear-progress {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          width: auto;

          --mdc-linear-progress-buffer-color: var(--light-primary-color);
        }
      `,
    ];
  }
}
