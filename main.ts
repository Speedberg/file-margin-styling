import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

const CSS_IDENTIFIER = 'speedberg-file-margin-styling';

const UNIT_TYPE = {
	px: 'px',
	percent: '%',
	em: 'em',
	vw: 'vw',
	vh: 'vh',
}

interface FileMarginSettings {
	sourceViewMargin: number;
	sourceViewUnit: string;
	previewViewMargin: number;
	previewViewUnit: string;
}

const DEFAULT_SETTINGS: FileMarginSettings = {
	sourceViewMargin: 0,
	sourceViewUnit: UNIT_TYPE.px,
	previewViewMargin: 0,
	previewViewUnit: UNIT_TYPE.px,
}

export default class FileMarginPlugin extends Plugin {
	settings: FileMarginSettings;

	async onload() {

		await this.loadSettings();
		this.addSettingTab(new FileMarginSettingsTab(this.app, this));

		this.addStyle();

		this.refresh();
	}

	refresh() {
		this.updateStyle()
	}

	onunload() {
		this.removeStyle();
	}

	addStyle()
	{
		const css = document.createElement('style');
		css.id = CSS_IDENTIFIER;
		document.getElementsByTagName("head")[0].appendChild(css);
		document.body.classList.add(CSS_IDENTIFIER);
		this.updateStyle();
	}

	updateStyle()
	{
		const styleElement = document.getElementById(CSS_IDENTIFIER);

		if (styleElement == null)
			return;

		styleElement.innerText = `
		.markdown-source-view {
			margin-left: ${this.settings.sourceViewMargin}${this.settings.sourceViewUnit} !important;
		}

		.markdown-source-view .cm-sizer
		{
			margin-left: 0px !important;
			margin-right: 0px !important;
		}

		.markdown-preview-view {
			margin-left: ${this.settings.previewViewMargin}${this.settings.previewViewUnit} !important;
		}
		`;
	}

	removeStyle()
	{
		document.getElementById(CSS_IDENTIFIER)?.remove();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class FileMarginSettingsTab extends PluginSettingTab {
	plugin: FileMarginPlugin;

	constructor(app: App, plugin: FileMarginPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'File Margins'});

		new Setting(containerEl)
		.setName('Preview View (Reading View)')
		.addText(text =>
			text.setValue(this.plugin.settings.previewViewMargin?.toString() ?? DEFAULT_SETTINGS.previewViewMargin.toString())
				.onChange(async (value) => {
					let numValue = Number(value);
					
					if (isNaN(numValue)) {
						text.setValue(DEFAULT_SETTINGS.previewViewMargin.toString());
						return;
					}
					
					this.plugin.settings.previewViewMargin = numValue;
					await this.plugin.saveSettings();
					this.plugin.refresh();
				}
				)
		)
		.addDropdown(dropdown => dropdown
			.addOption(UNIT_TYPE.px, UNIT_TYPE.px)
			.addOption(UNIT_TYPE.percent, UNIT_TYPE.percent)
			.addOption(UNIT_TYPE.em, UNIT_TYPE.em)
			.addOption(UNIT_TYPE.vh, UNIT_TYPE.vh)
			.addOption(UNIT_TYPE.vw, UNIT_TYPE.vw)
			.setValue(this.plugin.settings.previewViewUnit)
			.onChange(async (value) => {
				this.plugin.settings.previewViewUnit = value;
				await this.plugin.saveSettings();
				this.plugin.refresh();
			})
		);

		new Setting(containerEl)
		.setName('Source View (Edit Mode)')
		.addText(text =>
			text.setValue(this.plugin.settings.sourceViewMargin?.toString() ?? DEFAULT_SETTINGS.sourceViewMargin.toString())
				.onChange(async (value) => {
					let numValue = Number(value);
					
					if (isNaN(numValue)) {
						text.setValue(DEFAULT_SETTINGS.sourceViewMargin.toString());
						return;
					}
					
					this.plugin.settings.sourceViewMargin = numValue;
					await this.plugin.saveSettings();
					this.plugin.refresh();
				}
				)
		)
		.addDropdown(dropdown => dropdown
			.addOption(UNIT_TYPE.px, UNIT_TYPE.px)
			.addOption(UNIT_TYPE.percent, UNIT_TYPE.percent)
			.addOption(UNIT_TYPE.em, UNIT_TYPE.em)
			.addOption(UNIT_TYPE.vh, UNIT_TYPE.vh)
			.addOption(UNIT_TYPE.vw, UNIT_TYPE.vw)
			.setValue(this.plugin.settings.sourceViewUnit)
			.onChange(async (value) => {
				this.plugin.settings.sourceViewUnit = value;
				await this.plugin.saveSettings();
				this.plugin.refresh();
			})
		);
	}
}
