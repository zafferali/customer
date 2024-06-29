/**
 * @format
 */

// import 'react-native-gesture-handler'; 
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
// import './src/firebase/config';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['ReactImageView: Image source "null" doesn\'t exist'])

const Root = () => (
    <Provider store={store}>
      <App />
    </Provider>
  );
  
AppRegistry.registerComponent(appName, () => Root)
