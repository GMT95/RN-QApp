import * as React from 'react';
import { Text, View, StyleSheet, KeyboardAvoidingView,ScrollView,Button,TouchableOpacity } from 'react-native';
import { TextInput, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Constants, ImagePicker, Permissions } from 'expo';
import firebase from '../config/firebase'
import uuid from 'uuid';


// You can import from local files
//import AssetExample from './components/AssetExample';
const CLIENT_ID = 'X33HWKUOQCZ22UYJOHGQPVJ1VEDBD2JLJASKIJ2FLP30WO2J';
const CLIENT_SECRET = '4TL2JERARU1K54RC4CINBGJM0IXA0MCUWOAA1NO0QCUEJPXO';
const DATABASE = firebase.database();

export default class FormModal extends React.Component {
  state = {
    searchTerm: '',
    sinceValue: '',
    companyName: '',
    timingsFrom: '',
    timingsTo: '',
    image: '',
    masterObject: {image: []},
    firstImageUpload: false,
    secondImageUpload: false,
    thirdImageUpload: false,

  }

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA_ROLL)
    USER_ID = firebase.auth().currentUser.uid;
  }

  submitResponse() {
    const {searchTerm,sinceValue,companyName,timingsFrom,timingsTo,masterObject} = this.state;
    masterObject.address = searchTerm;
    masterObject.since = sinceValue;
    masterObject.companyName = companyName;
    masterObject.timingsFrom =  timingsFrom;
    masterObject.timingsTo = timingsTo;
    DATABASE
    .ref(`companies/${USER_ID}/`)
    .push(masterObject);
    //console.log(masterObject);
  }

  searchLocation(e) {
    const { searchTerm } = this.state;
    this.setState({ searchTerm: e })
    fetch(`https://api.foursquare.com/v2/venues/explore?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=20180323&limit=5&ll=24.865212755046993,67.02500130426029&query=${searchTerm}`)
      .then((res) => {
        return res.json()
      })
      .then((res2) => {
        res2.response.groups.map((value) => {
          this.setState({searchResult: value.items})
        })
      })
      .catch((err) => alert(err))
  }

  _pickImage = async (stateName) => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });
  
    this._handleImagePicked(pickerResult,stateName)
  };
  
  _handleImagePicked = async (pickerResult,stateName) => {
    try {
      if (!pickerResult.cancelled) {
        uploadUrl = await uploadImageAsync(pickerResult.uri);
        this.setState({ image: uploadUrl, [stateName] : true });
        this.state.masterObject.image.push(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({ uploading: false });
    }
  };
    


  render() {
    const {firstImageUpload,secondImageUpload,thirdImageUpload} = this.state;
    return (
      <View style={{flex: 1}}>
      <ScrollView>
      
        <Text style={styles.paragraph}>Add Company</Text>
        <TextInput
          label='Company Name'
          type='outlined'
          value={this.state.companyName}
          onChangeText={text => this.setState({companyName: text})}
          maxLength={15}
        />
        <TextInput
          label='Since'
          keyboardType='numeric'
          value={this.state.sinceValue}
          type='outlined'
          onChangeText={text => this.setState({sinceValue: text})}
          maxLength={4}
        />
        <TextInput
          label='Timings From(24 hour format)'
          keyboardType='numeric'
          type='outlined'
          value={this.state.timingsFrom}
          onChangeText={text => this.setState({timingsFrom: text})}
          maxLength={2}
        />
        <TextInput
          label='Timings To(24 hour format)'
          keyboardType='numeric'
          type='outlined'
          value={this.state.timingsTo}
          onChangeText={text => this.setState({timingsTo: text})}
          maxLength={2}
        />
        <TextInput
          label='Address'
          type='outlined'
          value={this.state.searchTerm}
          onChangeText={text => this.searchLocation(text)}
        />
        {this.state.searchResult && 
          this.state.searchResult.map((val,indx) => 
            <List.Item
            title={val.venue.name}
            description={val.venue.location.address}
            onPress={() => this.setState({searchTerm: val.venue.name})}
            right={props => 
              <TouchableOpacity 
                onPress={() => {this.state.searchResult.splice(indx,indx); this.setState({searchResult: this.state.searchResult})}} 
                style={{marginTop: 15}}>
                  <Text style={{color: 'red'}}>X</Text>
              </TouchableOpacity>
            }
          />
        )}
        {!firstImageUpload ?
        <Button
        title="Upload Image"
        color="#5F9EA0"
        onPress={() => this._pickImage(firstImageUpload)}
        /> : <Icon name="check" size={12} color="green"/>}
        {!secondImageUpload ?
        <Button
        title="Upload Image"
        color="#008B8B"
        onPress={() => this._pickImage(secondImageUpload)}
        /> : <Icon name="check" size={12} color="green"/>}
        {!thirdImageUpload ?
        <Button
        title="Upload Image"
        color="#008080"
        onPress={() => this._pickImage(thirdImageUpload)}
        /> : <Icon name="check" size={12} color="green"/>}
        <TouchableOpacity style={{paddingTop: 20}} onPress={_ => this.submitResponse()}>
          <Text style={{textAlign: "center"}}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    );
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


async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref()
    .child(uuid.v4());
  const snapshot = await ref.put(blob);

  // We're done with the blob, close and release it
  blob.close();

  return await snapshot.ref.getDownloadURL();
}
