const { app } = require("electron");
const { join, basename } = require("path");
const { writeFile, readFile } = require("fs/promises");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

app.whenReady().then(() => {
	const { BrowserWindow } = require("electron");
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		titleBarStyle: "default",
	});

	mainWindow.setTitle("Untitled - Notepad");
	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

	const { dialog } = require("electron");
	const template = [
		{
			label: "File",
			submenu: [
				{
					label: "Open",
					accelerator: "Ctrl+O",
					click: () => {
						dialog
							.showOpenDialog({
								title: "Select the File to Open",
								buttonLabel: "Open",
								filters: [
									{
										name: "Text Files",
										extensions: ["txt"],
									},
									{
										name: "All Files",
										extensions: ["*"],
									},
								],
								properties: ["openFile"],
							})
							.then((file) => {
								console.log(file.canceled);
								if (!file.canceled) {
									console.log(file.filePaths[0].toString());
									readFile(file.filePaths[0], "utf-8")
										.then((data) => {
											mainWindow.setTitle(
												`${basename(file.filePaths[0])} - Notepad`,
											);
											mainWindow.webContents.send("update-content", data);
										})
										.catch((err) => {
											console.error(err);
										});
								}
							})
							.catch((err) => {
								console.log(err);
							});
					},
				},
				{
					label: "Save",
					accelerator: "Ctrl+S",
					click: () => {
						dialog
							.showSaveDialog({
								title: "Select the File Path to save",
								defaultPath: join(__dirname, "untitled.txt"),
								buttonLabel: "Save",
								filters: [
									{
										name: "Text Files",
										extensions: ["txt"],
									},
								],
								properties: [],
							})
							.then((file) => {
								console.log(file.canceled);
								if (!file.canceled) {
									console.log(file.filePath.toString());

									mainWindow.webContents
										.executeJavaScript(
											`document.getElementById('textarea').textContent`,
										)
										.then((result) => {
											writeFile(file.filePath, result)
												.then(() => {
													readFile(file.filePath, "utf-8")
														.then((data) => {
															mainWindow.setTitle(
																`${basename(file.filePath)} - Notepad`,
															);
															mainWindow.webContents.send(
																"update-content",
																data,
															);
														})
														.catch((err) => {
															console.error(err);
														});
												})
												.catch((err) => {
													if (err) {
														throw err;
													}
												});
										})
										.catch((err) => {
											throw err;
										});
								}
							})
							.catch((err) => {
								console.log(err);
							});
					},
				},
				{ type: "separator" },
				{ label: "Exit", role: "close" },
			],
		},
		{
			label: "Edit",
			submenu: [
				{ label: "Undo", role: "undo" },
				{ label: "Redo", role: "redo" },
				{ label: "Cut", role: "cut" },
				{ label: "Copy", role: "copy" },
				{ label: "Paste", role: "paste" },
				{ type: "separator" },
				{ label: "Select All", role: "selectAll" },
				{ type: "separator" },
				{ label: "Toggle Spell Checker", role: "toggleSpellChecker" },
			],
		},
		{
			label: "Window",
			submenu: [
				{ label: "Full-screen", role: "toggleFullScreen" },
				{ label: "Minimize", role: "minimize" },
				{ type: "separator" },
				{ label: "Reset Zoom", role: "resetZoom" },
				{ label: "Zoom In", role: "zoomIn" },
				{ label: "Zoom Out", role: "zoomOut" },
				{ type: "separator" },
				{ label: "Reload", role: "reload" },
				{ label: "Force Reload", role: "forceReload" },
				{ label: "Toggle Dev Tools", role: "toggleDevTools" },
			],
		},
		{
			label: "About",
			submenu: [
				{
					label: "About",
					click: async () => {
						const options = {
							message: `
              App - ${app.getVersion()}
              NodeJS - ${process.versions.node}
              Chromium - ${process.versions.chrome}
              Electron - ${process.versions.electron}
              `,
							type: "none",
							title: "Notepad",
						};
						dialog.showMessageBox(mainWindow, options);
					},
				},
				{
					label: "Github",
					click: async () => {
						const options = {
							type: "question",
							title: "Confirmation",
							message: "Are you sure you want to go ",
							buttons: ["&Yes", "&No"],
						};
						dialog.showMessageBox(mainWindow, options).then((result) => {
							if (result.response !== 0) {
								return;
							}

							if (result.response === 0) {
								const { shell } = require('electron')
                shell.openExternal('https://github.com/flzyy/electron-notepad')
							}
						});
					},
				},
			],
		},
	];
  const { Menu } = require("electron");
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
