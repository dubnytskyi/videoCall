import { useEffect, useRef, useState } from "react";
import {
  connect,
  createLocalAudioTrack,
  createLocalVideoTrack,
  createLocalDataTrack,
  LocalDataTrack,
  Room,
  RemoteParticipant,
} from "twilio-video";
import { CollabOp, Participant } from "../types/collab";

type Props = {
  token: string;
  identity: string;
  role: 'notary' | 'client';
  onLocalDataTrack: (track: LocalDataTrack) => void;
  onRemoteData: (data: CollabOp) => void;
  onParticipantUpdate: (participant: Participant) => void;
};

export default function VideoRoom({ 
  token, 
  identity, 
  role, 
  onLocalDataTrack, 
  onRemoteData, 
  onParticipantUpdate 
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteParticipant, setRemoteParticipant] = useState<RemoteParticipant | null>(null);

  useEffect(() => {
    let mounted = true;

    const connectToRoom = async () => {
      try {
        console.log(`[${identity}] Creating local tracks...`);
        
        const [audio, video, data] = await Promise.all([
          createLocalAudioTrack().catch(err => {
            console.warn(`[${identity}] Audio track creation failed:`, err);
            return null;
          }),
          createLocalVideoTrack().catch(err => {
            console.warn(`[${identity}] Video track creation failed:`, err);
            return null;
          }),
          createLocalDataTrack(),
        ]);

        console.log(`[${identity}] Connecting to room...`);
        const roomInstance = await connect(token, { 
          tracks: [audio, video, data].filter(Boolean),
          name: "notary-room", // Fixed room name for both participants
          identity: identity
        });

        if (!mounted) return;

        setRoom(roomInstance);
        setIsConnected(true);

        // Display local video
        if (video && localVideoRef.current) {
          console.log(`[${identity}] Displaying local video`);
          localVideoRef.current.srcObject = new MediaStream([video.mediaStreamTrack]);
          localVideoRef.current.muted = true;
          localVideoRef.current.play().catch(err => {
            console.error(`[${identity}] Failed to play local video:`, err);
          });
        } else {
          console.warn(`[${identity}] No video track available`);
        }

        // Pass data track to parent
        onLocalDataTrack(data);

        // Handle participant connections
        roomInstance.on("participantConnected", (participant: RemoteParticipant) => {
          if (!mounted) return;
          
          setRemoteParticipant(participant);
          
          // Update participant info
          onParticipantUpdate({
            identity: participant.identity,
            role: role === 'notary' ? 'client' : 'notary',
            isConnected: true,
            isReady: true
          });

          participant.on("trackSubscribed", (track) => {
            if (track.kind === "video" && remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
              remoteVideoRef.current.play().catch(console.error);
            }
            
            if (track.kind === "data") {
              track.on("message", (msg: string) => {
                try {
                  const data = JSON.parse(msg) as CollabOp;
                  onRemoteData(data);
                } catch (error) {
                  console.warn("Bad JSON from DataTrack:", error);
                }
              });
            }
          });

          participant.on("trackUnsubscribed", (track) => {
            if (track.kind === "video" && remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          });
        });

        roomInstance.on("participantDisconnected", (participant: RemoteParticipant) => {
          if (!mounted) return;
          
          setRemoteParticipant(null);
          onParticipantUpdate({
            identity: participant.identity,
            role: role === 'notary' ? 'client' : 'notary',
            isConnected: false,
            isReady: false
          });
        });

        roomInstance.on("disconnected", () => {
          if (!mounted) return;
          setIsConnected(false);
          setRemoteParticipant(null);
        });

      } catch (error: any) {
        console.error(`[${identity}] Failed to connect to room:`, error);
        
        if (error.name === "NotAllowedError") {
          console.error(`[${identity}] Camera/microphone access denied`);
        } else if (error.name === "NotFoundError") {
          console.error(`[${identity}] No camera/microphone found`);
        } else if (error.name === "NotReadableError") {
          console.error(`[${identity}] Camera/microphone is being used by another application`);
        } else if (error.message.includes("duplicate identity")) {
          console.error(`[${identity}] Duplicate identity error - try refreshing the page`);
        } else {
          console.error(`[${identity}] Unknown error:`, error.message);
        }
      }
    };

    connectToRoom();

    return () => {
      mounted = false;
      if (room) {
        room.disconnect();
      }
    };
  }, [token, identity, role, onLocalDataTrack, onRemoteData, onParticipantUpdate]);

  return (
    <div className="flex flex-col gap-4">
      {/* Local Video */}
      <div className="relative">
        <video 
          ref={localVideoRef} 
          className="w-full h-48 rounded-lg shadow-lg bg-black object-cover" 
          playsInline 
          muted
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {identity} ({role})
        </div>
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Remote Video */}
      <div className="relative">
        <video 
          ref={remoteVideoRef} 
          className="w-full h-48 rounded-lg shadow-lg bg-black object-cover" 
          playsInline 
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {remoteParticipant?.identity || 'Waiting for participant...'}
        </div>
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${remoteParticipant ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>
      </div>
    </div>
  );
}
