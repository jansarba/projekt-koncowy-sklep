import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Radio, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export interface License {
  id: string;
  name: string;
  price: string;
}

interface BeatData {
  ismp3only: boolean;
}

interface LicensesProps {
  setSelectedLicense: (license: License | null) => void;
}

export const Licenses: React.FC<LicensesProps> = ({ setSelectedLicense }) => {
  const { id: beatId } = useParams<{ id: string }>();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [selected, setSelected] = useState<License | null>(null);
  const [isMp3Only, setIsMp3Only] = useState<boolean>(false);

  useEffect(() => {
    const fetchLicenseData = async () => {
      if (!beatId) return;

      try {
        const [licensesResponse, beatResponse] = await Promise.all([
          fetch(`${baseURL}/api/licenses?beatId=${beatId}`),
          fetch(`${baseURL}/api/beats/${beatId}`),
        ]);

        if (licensesResponse.ok) {
          const licensesData: License[] = await licensesResponse.json();
          setLicenses(licensesData);
          if (licensesData.length > 0) {
            const defaultLicense = licensesData[0];
            setSelected(defaultLicense);
            setSelectedLicense(defaultLicense);
          }
        } else {
          console.error('Failed to fetch licenses');
        }

        if (beatResponse.ok) {
          const beatData: BeatData = await beatResponse.json();
          setIsMp3Only(beatData.ismp3only);
        }
      } catch (error) {
        console.error('Error fetching license data:', error);
      }
    };

    fetchLicenseData();
  }, [beatId, setSelectedLicense]);

  const handleSelectionChange = (license: License) => {
    setSelected(license);
    setSelectedLicense(license);
  };

  return (
    <div className="px-4 flex flex-col items-center gap-4">
      {isMp3Only && (
        <div className="text-sm text-lightest mb-2 mt-2 max-w-[256px]">
          <p>Póki co, ten bit dostępny jest tylko w mp3 - na zamówienie stems lub exclusive jego autor chętnie zrobi ci reproda. Napisz do nas!</p>
        </div>
      )}
      <div className="mx-auto max-w-xs min-w-64">
        <RadioGroup value={selected} onChange={handleSelectionChange} aria-label="Beat License" className="space-y-2">
          {licenses.map((license) => (
            <Radio key={license.id} value={license} className="group relative flex cursor-pointer rounded-lg bg-white/5 py-3 px-5 text-white shadow-md transition focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white/10">
              <div className="flex w-full items-center justify-between">
                <div className="text-sm/6">
                  <p className="font-semibold text-white">{license.name}</p>
                  <div className="flex gap-2 text-white/50">
                    <div>{license.price}</div>
                  </div>
                </div>
                <CheckCircleIcon className="size-6 fill-white opacity-0 transition group-data-[checked]:opacity-100" />
              </div>
            </Radio>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};