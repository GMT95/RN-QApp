import * as React from 'react';
import { Text, View, StyleSheet,Button,AsyncStorage } from 'react-native';
import { Constants,Expo,Facebook } from 'expo';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';


export default class HomeTemp extends React.Component {
 
  render() {
  return ( 
    <View style={styles.container}>
    <Text style={styles.paragraph}>Are you Company or a User waiting for tokens</Text>
    <Button
        title="I am a Company"
        color="red"
        onPress={() => this.props.navigation.navigate('AddCompany')}
        />
    <Button
        title="I am waiting for tokens"
        color="orange"
        onPress={() => console.log('I am waiting for tokens')}
    />
    </View>);
  }

}

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
