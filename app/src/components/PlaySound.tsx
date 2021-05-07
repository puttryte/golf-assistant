import React, { useState } from 'react';
import Sound, { ReactSoundProps } from 'react-sound';
import {IonButton} from '@ionic/react';

const PlaySound = () => {
  const [status, setStatus] = useState<ReactSoundProps['playStatus']>('STOPPED');

  function togglePlayStatus() {
    setStatus(status => status === 'STOPPED' ? 'PLAYING' : 'STOPPED')
  }

  function statusLabel(status: ReactSoundProps['playStatus']): string {
    switch(status) {
      case 'STOPPED':
        return 'PLAY';
      case 'PLAYING':
        return 'STOP';
      default:
        return 'STOP';
    }
  }

  return (
    <div>
      <IonButton onClick={(click) => togglePlayStatus()}>{statusLabel(status)}</IonButton>
      <Sound
        url="./metro150.mp3"
        playStatus={status}
      />
    </div>
  );
}

export default PlaySound;