import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Appearance,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import DraggableFlatList from "react-native-draggable-flatlist"; /// important!!!

import ImagePicker from 'react-native-image-crop-picker';
import { Picker } from '@react-native-community/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, CheckBox, ListItem } from 'react-native-elements';

import auth from '@react-native-firebase/auth';
import { InterstitialAd, TestIds } from '@react-native-firebase/admob';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

import { adsFree, translate } from '../Utils';

import AsyncStorage from '@react-native-community/async-storage';

const adBannerUnitId = __DEV__ ? TestIds.BANNER : 
    (Platform.OS == 'ios' 
    ? 'ca-app-pub-1477690609272793/3050510769' 
    : 'ca-app-pub-1477690609272793/8274029234');

const adInterstitialUnitId = __DEV__ ? TestIds.INTERSTITIAL : 
    (Platform.OS == 'ios' 
    ? 'ca-app-pub-1477690609272793/3775880012' 
    : 'ca-app-pub-1477690609272793/9626786110');

const interstitial = InterstitialAd.createForAdRequest(adInterstitialUnitId);

const locations = [[37.551161, 126.988228], [35.658405, 139.745300], [40.689306, -74.044361], [51.500700, -0.124607], [48.858369, 2.294480], [-33.856792, 151.214657], [40.431867, 116.570375]];

export default class AddList extends Component {
    state = {
        category: 'Travel',
        viewmode: 'Map',
        locationChecked: true,
        dateChecked: true,
        date: new Date(),
        show: false,
        data: [],
        link: '',
        title: '',
        subtitle: '',
        thumbnail: '',
        loading: false,
        ads: true,
    };

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item, index, drag, isActive }) => (
      <ListItem
        title={
            <TextInput
                defaultValue={item.title}
                style={{
                    fontWeight: 'bold', 
                    borderBottomColor: Appearance.getColorScheme() === 'dark' ? "#fff" : '#002f6c',
                    flex:1,
                    color: Appearance.getColorScheme() === 'dark' ? "#fff" : "#002f6c",
                }}
                maxLength={40}
                onChangeText={(title) => {
                    if (title.length < 1) {
                        return;
                    }
                    var updateData = this.state.data;
                    updateData[index].title = title;
                    this.setState({data: updateData});
                }}
            />  
        }
        subtitle={
            <TextInput
                defaultValue={item.subtitle}
                style={{
                    borderBottomColor: Appearance.getColorScheme() === 'dark' ? "#fff" : '#002f6c',
                    flex:1,
                    color: Appearance.getColorScheme() === 'dark' ? "#fff" : "#002f6c",
                }}
                maxLength={40}
                onChangeText = {(subtitle) => {
                    if (subtitle.length < 1) {
                        return;
                    }
                    var updateData = this.state.data;
                    updateData[index].subtitle = subtitle;
                    this.setState({data: updateData});
                }}
            />  
        }
        leftAvatar={{ source: { uri: item.photo }, rounded: false}}
        containerStyle={{backgroundColor: Appearance.getColorScheme() === 'dark' ? '#002f6c' : '#fff'}}
        onLongPress={drag}
        rightElement={
            <TouchableOpacity style={{marginRight:5}} onPress={() => { 
                var updateData = this.state.data;
                updateData.splice(index, 1);
                this.setState({data: updateData}); }}>
                <Icon
                    name='cancel'
                    size={24}
                    color='#ff0000'
                />
            </TouchableOpacity>
        }
        bottomDivider
        onPress={() => {}}
      />
    )

    async componentDidMount() {
        const locationCheck = await AsyncStorage.getItem('location');
        const dateCheck = await AsyncStorage.getItem('date');
        this.setState({
            ads: !adsFree,
            locationChecked: locationCheck == 'true' ? true : false,
            dateChecked: dateCheck == 'true' ? true : false,
        });
        this.props.navigation.setOptions({ title: translate("AddList") });
        if (this.state.ads && !interstitial.loaded) {
            interstitial.load();
        }
    }
    
    render() {
        return(
            <SafeAreaView style={styles.container}>
                {this.state.loading ? 
                <View style={styles.buttonContainer}>
                    <ActivityIndicator size="large" color={Appearance.getColorScheme() === 'dark' ? '#fff' : "#002f6c"} />
                    <Text style={{color: Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'}}> {translate("AddListComment1")} </Text> 
                </View>
                : <ScrollView 
                    contentContainerStyle={styles.viewContainer}
                    style={{flex: 1, width: "100%"}}
                >
                    <View style={{height: 200, width: 100, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                        <Text style={{color: Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'}}> {translate("Category")} </Text>
                        <Picker
                            selectedValue={this.state.category}
                            style={{width: 130}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({category: itemValue})
                            }>
                            <Picker.Item label={translate("Travel")} value="Travel" color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("DailyLife")} value="Daily Life"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("Entertainment")} value="Entertainment"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("Sports")} value="Sports"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("News")} value="News"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("Education")} value="Education"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("Other")} value="Other"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                        </Picker>
                        <Text style={{color: Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'}}> {translate("ViewMode")} </Text>
                        <Picker
                            selectedValue={this.state.viewmode}
                            style={{width: 90}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({viewmode: itemValue})
                            }>
                            <Picker.Item label={translate("Map")} value="Map"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("List")} value="List"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                            <Picker.Item label={translate("Grid")} value="Grid"  color={Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'} />
                        </Picker>
                    </View>
                    <Text  
                        onPress={() => this.setState({show: !this.state.show})}
                        style={{color: Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'}}
                    > 
                        {this.state.date.toString()} 
                    </Text> 
                    {this.state.show && <DateTimePicker
                        style={{width: "100%", alignItems: 'center'}}
                        mode="date"
                        value={this.state.date}
                        is24Hour={true}
                        display="default" 
                        onChange={ (event, selectedDate) => {
                            var currentDate = selectedDate || new Date();
                            if (Platform.OS === 'android') {
                                currentDate.setHours(this.state.date.getHours(), this.state.date.getMinutes(), this.state.date.getSeconds());
                                this.setState({
                                    show: false,
                                });
                            }
                            this.setState({
                                date: currentDate,
                            });
                        }}
                    />}
                    {this.state.show && <DateTimePicker
                        style={{width: "100%"}}
                        mode="time"
                        value={this.state.date}
                        is24Hour={true}
                        display="default"
                        onChange={ (event, selectedDate) => {
                            const currentDate = selectedDate || new Date();
                            if (Platform.OS === 'android') {
                                this.setState({
                                    show: false,
                                });
                            }
                            this.setState({
                                date: currentDate,
                            });
                        }}
                    /> }
                    <View style={styles.cellView}>
                        <Input
                            onChangeText = {(title) => this.setState({title})}
                            inputStyle={styles.inputs}
                            maxLength={40}
                            placeholder={translate("Title")}
                            placeholderTextColor="#bdbdbd"
                            leftIcon={
                                <Icon
                                    name='title'
                                    size={24}
                                    color={Appearance.getColorScheme() === 'dark' ? '#ffffff' : '#002f6c'}
                                />
                            }
                        />
                    </View>
                    <View style={styles.cellView}>
                        <Input
                            multiline
                            onChangeText = {(subtitle) => this.setState({subtitle})}
                            inputStyle={styles.inputs}
                            maxLength={140}
                            placeholder={translate("Subtitle")}
                            placeholderTextColor="#bdbdbd"
                            leftIcon={
                                <Icon
                                    name='subtitles'
                                    size={24}
                                    color={Appearance.getColorScheme() === 'dark' ? '#ffffff' : '#002f6c'}
                                />
                            }
                        />
                    </View>
                    <View style={styles.cellView}>
                        <Input
                            autoCapitalize='none'
                            onChangeText = {(link) => this.setState({link})}
                            inputStyle={styles.inputs}
                            placeholder={translate("URLLink")}
                            placeholderTextColor="#bdbdbd"
                            leftIcon={
                                <Icon
                                    name='launch'
                                    size={24}
                                    color={Appearance.getColorScheme() === 'dark' ? '#ffffff' : '#002f6c'}
                                />
                            }
                        />
                    </View>
                    {this.state.data.length > 0 && <Text style={{textAlign: 'center', color: Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'}}> {translate("AddListComment2")} </Text>}
                    <View style={{ flex: 1, width: "80%", backgroundColor: Appearance.getColorScheme() === 'dark' ? '#002f6c' : '#ffffff' }}>
                        <DraggableFlatList
                            keyExtractor={this.keyExtractor}
                            data={this.state.data}
                            renderItem={this.renderItem}
                            onDragEnd={({ data }) => this.setState({ 
                                data: data,
                            })}
                        />
                    </View>
                    <TouchableOpacity style={[styles.buttonContainer, styles.loginButton, {height:45, width: "80%", borderRadius:5,}]} onPress={() => { 
                        ImagePicker.openPicker({
                            multiple: true,
                            mediaType: 'photo', //사진
                            includeExif: true,
                            maxFiles: 20,
                        }).then(images => {
                            var factor = Platform.OS == 'ios' ? 1000 : 1;
                            for (var i = 0; i<images.length; i++) {
                                try {
                                    if (this.state.data.length > 19) {
                                        continue;
                                    }
                                    console.log(images[i]);
                                    if (Platform.OS == 'ios') {
                                        this.setState({
                                            data: this.state.data.concat({ 
                                                date: firestore.Timestamp.fromMillis(parseInt(images[i].modificationDate) * factor),
                                                lat: images[i].exif["{GPS}"].LatitudeRef != "S" ? images[i].exif["{GPS}"].Latitude : -images[i].exif["{GPS}"].Latitude,
                                                long: images[i].exif["{GPS}"].LongitudeRef != "W" ? images[i].exif["{GPS}"].Longitude : -images[i].exif["{GPS}"].Longitude,
                                                photo: images[i].path,
                                                title: i.toString(),
                                                subtitle: i.toString(),
                                            }),
                                        });
                                    } else {
                                        var latitudeStrings = images[i].exif["GPSLatitude"].split(',');
                                        var longitudeStrings = images[i].exif["GPSLongitude"].split(',');

                                        var latitudeD = latitudeStrings[0].split('/');
                                        var latitudeM = latitudeStrings[1].split('/');
                                        var latitudeS = latitudeStrings[2].split('/');

                                        var longitudeD = longitudeStrings[0].split('/');
                                        var longitudeM = longitudeStrings[1].split('/');
                                        var longitudeS = longitudeStrings[2].split('/');

                                        var latitude = parseInt(latitudeD[0]) / parseInt(latitudeD[1]) + (parseInt(latitudeM[0]) / parseInt(latitudeM[1]) / 60) + (parseInt(latitudeS[0]) / parseInt(latitudeS[1]) / 3600);
                                        var longitude = parseInt(longitudeD[0]) / parseInt(longitudeD[1]) + (parseInt(longitudeM[0]) / parseInt(longitudeM[1]) / 60) + (parseInt(longitudeS[0]) / parseInt(longitudeS[1]) / 3600);

                                        if (images[i].exif["GPSLatitudeRef"] == "S") { latitude = -latitude; }
                                        if (images[i].exif["GPSLongitudeRef"] == "W") { longitude = -longitude; }

                                        this.setState({
                                            data: this.state.data.concat({ 
                                                date: firestore.Timestamp.fromMillis(parseInt(images[i].modificationDate) * factor),
                                                lat: latitude,
                                                long: longitude,
                                                photo: images[i].path,
                                                title: i.toString(),
                                                subtitle: i.toString(),
                                            }),
                                        });
                                    }
                                } catch (e) { // location data가 없는 것으로 추정
                                    console.log(e);
                                    var random = Math.floor(Math.random() * locations.length);
                                    this.setState({
                                        data: this.state.data.concat({ 
                                            date: firestore.Timestamp.fromMillis(parseInt(images[i].modificationDate) * factor),
                                            lat: locations[random][0],
                                            long: locations[random][1],
                                            photo: images[i].path,
                                            title: i.toString(),
                                            subtitle: i.toString(),
                                        }),
                                    });
                                } finally {
                                    if (i == 0) {
                                        this.setState({thumbnail: images[i].path});
                                    }
                                }
                            } 
                        });
                    }}>
                        <Text style={styles.loginText}>{translate("AddPhotos")}</Text>
                    </TouchableOpacity>
                    <CheckBox
                        containerStyle={styles.cell}
                        title={translate("AddListComment3")}
                        iconType='material'
                        checkedIcon='check-box'
                        uncheckedIcon='check-box-outline-blank'
                        checkedColor='#002f6c'
                        checked={this.state.locationChecked}
                        onPress={() => this.setState({locationChecked: !this.state.locationChecked})}
                    />
                    <CheckBox
                        containerStyle={styles.cell}
                        title={translate("AddListComment4")}
                        iconType='material'
                        checkedIcon='check-box'
                        uncheckedIcon='check-box-outline-blank'
                        checkedColor='#002f6c'
                        checked={this.state.dateChecked}
                        onPress={() => this.setState({dateChecked: !this.state.dateChecked})}
                    />
                    <TouchableOpacity style={[styles.buttonContainer, styles.loginButton, {height:45, width: "80%", borderRadius:5,}]} onPress={async () => {
                        if (this.state.title.length < 1 || this.state.title.subtitle < 1 || this.state.title.link < 1) {
                            Alert.alert(
                                translate("Error"),
                                translate("AddListComment5"),
                                [
                                {text: translate("OK"), onPress: () => console.log('OK Pressed')},
                                ],
                                { cancelable: false }
                            );
                            return;
                        }
                        if (this.state.data.length < 1) {
                            Alert.alert(
                                translate("Error"),
                                translate("AddListComment6"), //하나 이상의 사진을 추가해주세요.
                                [
                                {text: translate("OK"), onPress: () => console.log('OK Pressed')},
                                ],
                                { cancelable: false }
                            );
                            return;
                        }
                        if (!this.state.locationChecked) {
                            var updateData = this.state.data;
                            var random = 0;
                            for (var i = 0; i < updateData.length; i++) {
                                random = Math.floor(Math.random() * locations.length);
                                updateData[i].lat = locations[random][0];
                                updateData[i].long = locations[random][1];
                            }
                            this.setState({
                                data: updateData,
                            });
                        }
                        if (!this.state.dateChecked) {
                            var updateData = this.state.data;
                            for (var i = 0; i < updateData.length; i++) {
                                updateData[i].date = firestore.Timestamp.fromMillis((new Date()).getTime());
                            }
                            this.setState({
                                data: updateData,
                            });
                        }

                        if (this.state.link.length > 0 && this.state.link.substring(0, 4) !== 'http') {
                            this.setState({
                                link: "https://" + this.state.link,
                            });
                        }

                        await AsyncStorage.setItem('location', this.state.locationChecked ? 'true' : 'false');
                        await AsyncStorage.setItem('date', this.state.dateChecked ? 'true' : 'false');


                        this.setState({loading: true})
                        await firestore()
                        .collection(auth().currentUser.email)
                        .add({
                            category: this.state.category,
                            date: firestore.Timestamp.fromMillis(this.state.date.getTime()),
                            modifyDate: firestore.Timestamp.fromMillis((new Date()).getTime()),
                            link: this.state.link,
                            title: this.state.title,
                            subtitle: this.state.subtitle,
                            like: {},
                            view: [],
                            viewcode: this.state.viewmode == 'Map' ? 0 : (this.state.viewmode == 'List' ? 1 : 2),
                        })
                        .then(async (documentSnapshot) => {
                            await firestore()
                            .collection("Users")
                            .doc(auth().currentUser.email)
                            .update({
                                modifyDate: firestore.Timestamp.fromMillis((new Date()).getTime()),
                            });
                            var filename = this.state.thumbnail.split('/');

                            var storageRef = storage().ref(`${auth().currentUser.email}/${documentSnapshot._documentPath._parts[1]}/${filename[filename.length - 1]}`);
                            await storageRef.putFile(this.state.thumbnail);

                            this.setState({thumbnail: filename[filename.length - 1]})

                            var updateData = this.state.data;
                            for (var i=0; i < this.state.data.length; i++) {
                                filename = this.state.data[i].photo.split('/');
                                storageChildRef = storage().ref(`${auth().currentUser.email}/${documentSnapshot._documentPath._parts[1]}/${filename[filename.length - 1]}`)
                                await storageChildRef.putFile(this.state.data[i].photo);

                                updateData[i].photo = filename[filename.length - 1];
                            }
                            this.setState({data: updateData});

                            await firestore()
                                .collection(auth().currentUser.email)
                                .doc(documentSnapshot._documentPath._parts[1])
                                .update({
                                    thumbnail: this.state.thumbnail,
                                    data: this.state.data
                                });
                            Alert.alert(
                                translate("Success"),
                                translate("AddListComment7"), //성공적으로 업로드됐습니다.
                                [
                                {text: translate("OK"), onPress: () => console.log('OK Pressed')},
                                ],
                                { cancelable: false }
                            );
                            if (this.state.ads && interstitial.loaded) {
                                interstitial.show();
                            }
                            this.setState({loading: false});
                            this.props.route.params.onPop();
                            this.props.navigation.pop();
                        });
                    }}>
                        <Text style={styles.loginText}>{translate("AddList")}</Text>
                    </TouchableOpacity>
                </ScrollView>}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Appearance.getColorScheme() === 'dark' ? "#002f6c" : "#fff",
        width: "100%"
    },
    viewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: { width: "80%", height: 50 },
    cellView: { 
        width: "84%",
        height: 60, 
    },
    inputs:{
        marginLeft:15,
        borderBottomColor: Appearance.getColorScheme() === 'dark' ? "#fff" : '#002f6c',
        flex:1,
        color: Appearance.getColorScheme() === 'dark' ? "#fff" : "#002f6c",
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom:5,
    },
    loginButton: {
        backgroundColor: "#002f6c",
        borderColor: "#fff",
        borderWidth: 1,
    },
    loginText: {
        color: 'white',
    },
});