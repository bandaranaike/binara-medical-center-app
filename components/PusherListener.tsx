"use client";

import {useEffect} from "react";
import Pusher, {Channel} from "pusher-js";

interface PusherListenerProps {
    channelName: string;
    eventName: string;
    onEventTriggerAction: (data: any) => void;
}

export default function PusherListener(
    {
        channelName,
        eventName,
        onEventTriggerAction,
    }: PusherListenerProps) {
    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            forceTLS: true,
        });

        const channel: Channel = pusher.subscribe(channelName);

        channel.bind(eventName, (data: any) => {
            onEventTriggerAction(data);
        });

        return () => {
            channel.unbind(eventName);
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, [channelName, eventName, onEventTriggerAction]);

    return null; // this component doesn't render UI
}
