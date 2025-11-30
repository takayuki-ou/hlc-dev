import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
// import GOOGLE_MAPS_API_LOADER from '@salesforce/resourceUrl/GoogleMapsApiLoader';
// import GoogleAPIKey from '@salesforce/label/c.GoogleAPIKey';

export default class GoogleMapAddressPicker extends LightningElement {
    
    map;
    mapInitialized = false; // 初期化済みフラグ
    // marker;
    // geocoder;
    // _initialized = false;
    // _scriptLoaded = false;

    // renderedCallback() {
    //     // 初期化処理が一度だけ実行されるように制御
    //     if (this.mapInitialized) {
    //         return;
    //     }
    //     this.mapInitialized = true;
    //     console.log('GoogleMapsApiLoader', GOOGLE_MAPS_API_LOADER + '/index/index.min.js');

    //     // 静的リソースとしてアップロードしたライブラリを読み込む
    //     loadScript(this, GOOGLE_MAPS_API_LOADER + '/index.min.js')
    //         .then(() => {
    //             // ライブラリのLoaderクラスを使ってGoogle Maps APIを初期化
    //             const loader = new window.google.maps.Loader({
    //                 apiKey: GoogleAPIKey, // 実際のAPIキーに置き換えてください
    //                 version: 'weekly',
    //             });

    //             // Google Maps JavaScript API本体をロード
    //             return loader.load();
    //         })
    //         .then(() => {
    //             // 地図を表示するdiv要素を取得
    //             const mapContainer = this.template.querySelector('.map-container');

    //             // Mapコンストラクタで地図を生成
    //             this.map = new window.google.maps.Map(mapContainer, {
    //                 center: { lat: 35.6895, lng: 139.6917 }, // 初期表示位置（例: 東京）
    //                 zoom: 10,
    //             });
    //         })
    //         .catch(error => {
    //             console.error('Failed to load Google Maps:', error);
    //             // ユーザーへのエラー表示処理などをここに追加
    //         });
    // }

    connectedCallback() {
        let mapsUrl = `https://maps.googleapis.com/maps/api/js?key=dummy`;
        let script = document.createElement('script');
        script.setAttribute('src', mapsUrl);
        document.head.appendChild(script);
        window.initMap = () => {
            let map = new google.maps.Map(this.template.querySelector('#map'), {
                center: {lat: 37.7749, lng: -122.4194},
                zoom: 12
                });
        };
    }

}