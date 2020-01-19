import React, { PureComponent } from 'react';
import {
	Text,
	View,
	PermissionsAndroid,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Alert
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import logger from 'react-native-simple-logger';
import { Dropbox } from 'dropbox';

class App extends PureComponent {
	state = {
		loading: false
	};

	createPDF = async () => {
		try {
			this.setState({ loading: true });

			const options = {
				html: '<h1>PDF TEST</h1>',
				fileName: 'test',
				directory: 'Documents',
				base64: true
			};

			const file = await RNHTMLtoPDF.convert(options);

			logger.log('file stored: ', file, true);

			const dbx = new Dropbox({
				accessToken: '4VbXI3hP8UAAAAAAAAAADY9KEJOVpMZPFgpqEDJRHfWKAQ8QF8352ObTBcjohGGr',
				fetch
			});

			const fileListResponse = await dbx.filesListFolder({ path: '' });

			logger.log('filesListFolder', fileListResponse);


			const buff = this.base64ToArrayBuffer(file.base64);

			const fileUploadResponse = await dbx.filesUpload({
				path: `/test_${Math.floor(100000 + (Math.random() * 900000))}.pdf`,
				contents: buff
			});

			logger.log('fileUploadResponse', fileUploadResponse);

			this.setState({ loading: false });

			Alert.alert(
				'File Upload Success!',
				'File uploaded successfully. Please check your dropbox account to view the file'
			);
		} catch (error) {
			this.setState({ loading: false });

			logger.log('File store error: ', error, true);

			Alert.alert('File Upload Error!', JSON.stringify(error));
		}
	};

	base64ToArrayBuffer = (base64) => {
		const binary_string = atob(base64);
		const len = binary_string.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	};

	requestStoragePermission = async () => {
		try {
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				this.createPDF();
			} else {
				logger.error('Storage permission denied');
			}
		} catch (error) {
			logger.error('ask permissions error: ', error);
		}
	};

	renderLoader = () => {
		if (this.state.loading) {
			return (
				<View style={styles.loaderContainer}>
					<ActivityIndicator color={'white'} size={'large'} />
				</View>
			);
		}

		return null;
	};

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.declaration}>
					Click on below button to convert html into pdf and upload file into Dropbox
				</Text>

				<TouchableOpacity
					activeOpacity={0.6}
					onPress={this.requestStoragePermission}
					style={styles.button}
				>
					<Text style={styles.buttonLabel}> Click Me </Text>
				</TouchableOpacity>

				{this.renderLoader()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 15
	},
	declaration: {
		textAlign: 'center'
	},
	button: {
		backgroundColor: '#2475B0',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 5,
		marginTop: 10
	},
	buttonLabel: {
		color: 'white'
	},
	loaderContainer: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.3)',
		alignItems: 'center',
		justifyContent: 'center'
	}
});

export default App;
