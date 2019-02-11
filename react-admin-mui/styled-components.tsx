import { Theme } from "@material-ui/core/styles/createMuiTheme";
import * as styledComponents from "styled-components";

const { default: styled, css, injectGlobal, keyframes, ThemeProvider } = styledComponents as styledComponents.ThemedStyledComponentsModule<Theme>;

export { css, injectGlobal, keyframes, ThemeProvider };
export default styled;
