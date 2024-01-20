"use client"
import React, {useEffect, useState} from "react";
import ky from "ky";
import Loader from "@/app/component/Loader";
import {formatDistanceToNow, parse} from 'date-fns';
import {redirect, RedirectType} from "next/navigation";
import Link from "next/link";

export interface Email {
  subject: string;
  date: string;
  from: string;
  body: string;
  id?: number;
}

async function fetchData() {
  try {
    const response = await ky.get('/api/mails');
    return await response.json();
  } catch (error) {
    console.error('A error occurred:', error);
    return null;
  }
}

export default function Home() {
  const [data, setData] = useState<Email[]>();
  const [isLoading, setLoading ] = useState<boolean>(false);
  const refreshData = () => {
    setLoading(true);
    fetchData().then(fetchedData => {
      setData(fetchedData as Email[]);
      setLoading(false);
    });
  }
  useEffect(() => {
    refreshData();
  }, []);


  if(!data) {
    return <Loader/>;
  }
  return (
      <div className="shadow overflow-hidden rounded-md my-4 mx-12">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs leading-4 font-medium text-gray-900 uppercase w-1/6">Subject</th>
            <th className="px-3 py-3 text-left text-xs leading-4 font-medium text-gray-900 uppercase w-3/6">Content</th>
            <th className="px-3 py-3 text-left text-xs leading-4 font-medium text-gray-900 uppercase">From</th>
            <th className="px-3 py-3 text-left text-xs leading-4 font-medium text-gray-900 uppercase">Date</th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {data.map((email: Email, index: React.Key) => (
              <tr key={index}>
                <Link href={`/mail/${email.id}`}>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">{email.subject}</td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900">{email.body}</td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">{email.from}</td>
                  <td className="px-3 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">{email.date}</td>

                </Link>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}
