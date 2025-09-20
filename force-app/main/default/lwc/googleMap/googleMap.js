import { LightningElement, track } from "lwc";

export default class MapComponent extends LightningElement {
  @track address = "";
  @track latitude = 35.681;
  @track longitude = 139.767;

  iframe;
  messageListener;

  // VisualforceページのURLを動的に生成
  get vfPageUrl() {
    return "/apex/GoogleMapPage";
  }

  connectedCallback() {
    // メッセージリスナーを設定
    this.messageListener = this.handleMessage.bind(this);
    window.addEventListener("message", this.messageListener);
  }

  disconnectedCallback() {
    // メッセージリスナーを削除
    if (this.messageListener) {
      window.removeEventListener("message", this.messageListener);
    }
  }

  handleIframeLoad(event) {
    this.iframe = event.target;
    // 初期位置を設定
    this.sendLocationToMap(this.latitude, this.longitude, this.address);
  }

  // Visualforceページからのメッセージを処理
  handleMessage(event) {
    // セキュリティ: 送信元を確認（本番環境では適切なドメインを指定）
    // if (event.origin !== 'https://your-domain.lightning.force.com') return;

    const data = event.data;
    if (data && data.type === "LOCATION_UPDATE") {
      // マーカーの位置が更新された時の処理
      this.latitude = data.lat;
      this.longitude = data.lng;
      this.address = data.address || "";
    }
  }

  // 入力フィールドの変更ハンドラー
  handleAddressChange(event) {
    this.address = event.target.value;
  }

  handleLatitudeChange(event) {
    this.latitude = parseFloat(event.target.value) || 0;
  }

  handleLongitudeChange(event) {
    this.longitude = parseFloat(event.target.value) || 0;
  }

  // 入力値から地図を更新
  updateMapFromInputs() {
    this.sendLocationToMap(this.latitude, this.longitude, this.address);
  }

  // 地図に位置情報を送信
  sendLocationToMap(lat, lng, address = "") {
    if (this.iframe && this.iframe.contentWindow) {
      const message = {
        type: "SET_LOCATION",
        lat: lat,
        lng: lng,
        address: address
      };
      this.iframe.contentWindow.postMessage(message, "*");
    }
  }

  // 大阪に移動（既存機能を更新）
  panToOsaka() {
    this.latitude = 34.6937;
    this.longitude = 135.5023;
    this.address = "大阪府大阪市";
    this.sendLocationToMap(this.latitude, this.longitude, this.address);
  }
}
