// Examples:
// const entityId = this.config.entity;
// const playlist = hass.states[entityId].attributes;
//    ${playlist['Unorganized']['name']}<br>
// ${playlist['Unorganized']['image']}<br>
// ${playlist['Unorganized']['uri']}<br>


class SpotifyPlaylistCard extends HTMLElement {

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    setConfig(config) {
      if (!config.entity) {
        throw new Error('Please define an entity.');
      }
      const root = this.shadowRoot;
      if (root.lastChild) root.removeChild(root.lastChild);
  
      const cardConfig = Object.assign({}, config);
      if (!cardConfig.title) {
        cardConfig.title = `Playlists`;
      } 
      
      if (!config.size) {
        config.size = `15vmin`;
      }

      if (!config.columns) {
        config.columns = 3;
      }

      if (!config.media_player) {
        config.media_player = `default`;
      }

      if (!config.speaker_name) {
        config.speaker_name = `speaker name`;
      }

      const card = document.createElement('div');
      const content = document.createElement('div');
      const style = document.createElement('style');

      style.textContent = `

      button {
        border: 0px;
        padding: 0;
        color: #FFFFFF;
        border: 0;
        width:100%
        font-size: 14px;
        margin: 0;
        background-color: rgba(0,0,0,0.0);
      }

      button:hover {
      }

      button img {
          display: block;
          width: 100%;
          border: 2px; 
          border-radius: 4px;             
      `;
             
      style.textContent += `    height: `;
      style.textContent += config.size;
      style.textContent += `;
                width: `;
      style.textContent += config.size;
      style.textContent += `;
    }`
            
    style.textContent += `
          .grid-container {
            justify-content: center;
            justify-items: center;
            align-items: center;
            display: grid;
            border: 0;
            grid-gap: 8px; 
            grid-template-columns: auto`;
      var cssColumns = ' auto'.repeat(config.columns);
      style.textContent += cssColumns;
      style.textContent += `;}

      .grid-item {
        border: 0;
        padding: 0;
        position: relative; 
      }
      .grid-item-text {
        border: 0;
        padding: 18px 10px 10px 10px;
        text-align:left;
        position: absolute; 
        bottom: 0; 
        width: 100%;
        box-sizing:border-box;
        color: white;
        background: rgb(0,0,0);
        background: linear-gradient(360deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 69%, rgba(0,0,0,0) 100%);
        overflow: hidden;
        text-overflow: ellipsis;
        border-radius: 4px; 
      }     
      .grid-title {
        grid-row: 1 / span 4; 
        text-align: center; 
        vertical-align: text-top;
        writing-mode: vertical-rl; 
      }
      .grid-item ha-icon {
        -ms-transform: rotate(90deg); /* IE 9 */
        -webkit-transform: rotate(90deg); /* Safari */
        transform: rotate(90deg);
      }
      `; 
      content.innerHTML = `
      <div id='content'>
      </div>
      `;
      
      if (config.show_title) {
        card.header = cardConfig.title;
      }
      card.appendChild(content);
      card.appendChild(style);
      root.appendChild(card);
      this._config = cardConfig;
    }
  
 
    set hass(hass) {
      const config = this._config;
      const root = this.shadowRoot;
      const card = root.lastChild;
      this.myhass = hass;
      let card_content = ''
      card_content += `
      <div class="grid-container">
        <div class="grid-item grid-title">
          <ha-icon icon="mdi:spotify"></ha-icon>
          <strong>Spotify Playlists</strong>
        </div>
      `;
       
      if (hass.states[config.entity]) {
        const playlist = hass.states[config.entity].attributes;

        let column_count = 0
        
        for (let entry in playlist) {
          if (entry !== "friendly_name" && entry !== "icon" && entry !== "homebridge_hidden") {
            card_content += `<div class="grid-item"><button raised id ='playlist${playlist[entry]['id']}'><img src="${playlist[entry]['image']}"></button>`;
            if (config.show_name == true) {
              card_content += `<div class="grid-item-text">${playlist[entry]['name']}</div>`;
            };
            card_content += `</div>`;
          }
        } 
      };
      card_content += `</div>`;
//      card_content += `
//      <ha-icon icon="mdi:speaker"></ha-icon><select name="device_name">
//      `;    

//      if (hass.states['sensor.chromecast_devices']) {
//        const chromecastSensor = hass.states['sensor.chromecast_devices'];
        
//        if (chromecastSensor) {
//         const chromecastDevices = JSON.parse(chromecastSensor.attributes.devices_json);
//          for (let x in chromecastDevices) {
//            card_content += `
//              <option value ="${chromecastDevices[x]['name']}">${chromecastDevices[x]['name']}</option>
//            `;  
//          }
//        }


//      };
      
//      card_content += `</select>`;


      root.lastChild.hass = hass;
      root.getElementById('content').innerHTML = card_content;

      if (hass.states[config.entity]) {
        const playlist = hass.states[config.entity].attributes;
        const media_player = config.media_player;
        const speaker_name = config.speaker_name;

        for (let entry in playlist) {
          if (entry !== "friendly_name" && entry !== "icon" && entry !== "homebridge_hidden") {
            card.querySelector(`#playlist${playlist[entry]['id']}`).addEventListener('click', event => {
              if (media_player == "echo") {
                const myPlaylist = {"entity_id": speaker_name, "media_content_type": "playlist", "media_content_id": `${playlist[entry]['uri']}`};
                this.myhass.callService('media_player', 'play_media', myPlaylist);                
              }
              else if (media_player == "spotcast") {
                const spotcastPlaylist = {"device_name": speaker_name, "uri": `${playlist[entry]['uri']}`};
                this.myhass.callService('spotcast', 'start', spotcastPlaylist);
              }
            });            
          }  
        }
      }
    }
    getCardSize() {
      return 1;
    }
}
  
customElements.define('spotify-playlist-card', SpotifyPlaylistCard);