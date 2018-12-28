import * as React from 'react';
import { Text, View, StyleSheet,Button,AsyncStorage,YellowBox,Platform, InteractionManager } from 'react-native';
import { Constants,Facebook } from 'expo';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';
import HomeTemp from './screens/HomeTemp';
import AddCompany from './screens/AddCompany';
import firebase from './config/firebase';
import _ from 'lodash';

const _setTimeout = global.setTimeout;
const _clearTimeout = global.clearTimeout;
const MAX_TIMER_DURATION_MS = 60 * 1000;
if (Platform.OS === 'android') {
// Work around issue `Setting a timer for long time`
// see: https://github.com/firebase/firebase-js-sdk/issues/97
    const timerFix = {};
    const runTask = (id, fn, ttl, args) => {
        const waitingTime = ttl - Date.now();
        if (waitingTime <= 1) {
            InteractionManager.runAfterInteractions(() => {
                if (!timerFix[id]) {
                    return;
                }
                delete timerFix[id];
                fn(...args);
            });
            return;
        }

        const afterTime = Math.min(waitingTime, MAX_TIMER_DURATION_MS);
        timerFix[id] = _setTimeout(() => runTask(id, fn, ttl, args), afterTime);
    };

    global.setTimeout = (fn, time, ...args) => {
        if (MAX_TIMER_DURATION_MS < time) {
            const ttl = Date.now() + time;
            const id = '_lt_' + Object.keys(timerFix).length;
            runTask(id, fn, ttl, args);
            return id;
        }
        return _setTimeout(fn, time, ...args);
    };

    global.clearTimeout = id => {
        if (typeof id === 'string' && id.startWith('_lt_')) {
            _clearTimeout(timerFix[id]);
            delete timerFix[id];
            return;
        }
        _clearTimeout(id);
    };
}

class SignInScreen  extends React.Component {
  async logIn() {
    try {
      const {
        type,
        token,
       } = await Facebook.logInWithReadPermissionsAsync('277830099567519', {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        fetch(`https://graph.facebook.com/me?access_token=${token}`)
        .then((res) => res.json())
        .then((tokenKey) => {
          firebase.database().ref(`users/${tokenKey.id}/`)
          .set(tokenKey)
          return tokenKey
        })
        .then((asyncStoreToken) => {
          AsyncStorage.setItem('userToken',JSON.stringify(asyncStoreToken))
          .then(() => this.props.navigation.navigate('App'))
        })
        .catch(error => {
          console.log(error);
        });
        

        } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }
  
  
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          Change code in the editor and watch it change on your phone! Save to get a shareable url.
        </Text>
      <Button
        title="Login with Facebook"
        onPress={() => this.logIn()}
        />
      <Button
        title="color"
        color="black"
        onPress={() => console.log('sdsd')}
        />
      </View>
    );
  }
}

const AppStack = createStackNavigator({ Home: HomeTemp, AddCompany: AddCompany});
const AuthStack = createStackNavigator({ SignIn: SignInScreen });


export default createAppContainer(createSwitchNavigator(
  {
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'Auth',
  }
));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
