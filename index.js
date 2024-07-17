/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import React from 'react';
import { Provider } from 'react-redux';
import App from './src/App';
import { name as appName } from './app.json';
import store from './src/redux/store';
import { AuthenticationWrapper } from './src/firebase/auth';

LogBox.ignoreLogs(['ReactImageView: Image source "null" doesn\'t exist']);

const Root = () => (
  <Provider store={store}>
    <AuthenticationWrapper>
      <App />
    </AuthenticationWrapper>
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
