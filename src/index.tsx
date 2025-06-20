import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from "@ui5/webcomponents-react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { store } from "./redux/store";
import reportWebVitals from "./reportWebVitals";
import "./util/i18n";

// Imports necessary to use any other theme then "sap_fiori_3"
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <Router>
  <Provider store={store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>,
  </Router>
);

reportWebVitals();