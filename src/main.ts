import "./assets/base.scss";

import { createApp } from "vue";
import App from "./App.vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faDownload, faFileImage, faFilePdf, faMagnifyingGlass, faUpload } from "@fortawesome/free-solid-svg-icons";
import { faNoteSticky, faFilePdf as faFilePdf2 } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faDownload, faFileImage, faNoteSticky, faMagnifyingGlass, faFilePdf, faFilePdf2, faUpload, faDownload);

createApp(App)
	.component("font-awesome-icon", FontAwesomeIcon)
	.mount("#app");
