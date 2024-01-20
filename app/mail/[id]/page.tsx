"use client"
import React, {useEffect, useState} from 'react';
import { formatDistanceToNow , parse as parsed} from 'date-fns';
import {useRouter} from "next/navigation";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import ky from "ky";
import Loader from "@/app/component/Loader";
import parse from 'html-react-parser';
import quotedPrintable from 'quoted-printable';
import utf8 from 'utf8';
interface Email {
    subject: string;
    from: string;
    date: string;
    body: string;
}

interface EmailDetailProps {
    email: Email;
}
async function fetchData(id: String): Promise<Email | null> {
    try {
        const response = await ky.get(`/api/mail/${id}`);
        return await response.json();
    } catch (error) {
        console.error('A error occurred:', error);
        return null;
    }
}
const EmailDetail: ({params}: { params: { id: string } }) => (React.JSX.Element) = ({params}: {params: {id: string}}) => {
    const [email, setEmail] = useState<Email | null>();
    useEffect(() => {
        fetchData(params.id).then((data) => setEmail(data));
    }, []);
    if(!email) {
        return <Loader/>
    }
    console.log(email.body);

    const decodedBody = utf8.decode(quotedPrintable.decode(email.body));

    return (
        <div className="shadow rounded-lg mx-12 my-6 p-6">
            <h2 className="text-xl font-bold text-gray-900">{email.subject}</h2>
            <div className="text-sm text-gray-500 mt-1">
                From: <span className="text-gray-900">{email.from}</span>
            </div>
            <div className="text-sm text-gray-500">
                Date: <span className="text-gray-900">{formatDistanceToNow(parsed(email.date, "EEE, dd MMM yyyy HH:mm:ss xx", new Date()))} ago</span>
            </div>
            <div className="mt-4 whitespace-pre-wrap">
                <div className="mt-4" dangerouslySetInnerHTML={{__html: decodedBody}}/>
            </div>
        </div>
    );
};

export default EmailDetail;