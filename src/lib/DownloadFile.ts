export function downloadFile(dataUrl: string, filename: string) {
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename;
	link.target = "_blank";
	link.click();
	link.remove();
}
