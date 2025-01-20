import { Radio, RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
const baseURL = import.meta.env.VITE_API_BASE_URL;

export interface License {
  id: string;
  name: string;
  price: string;
}

interface LicensesProps {
  setSelectedLicense: (license: License | null) => void; // Function passed from the parent component
  beatId: string; // Pass the beatId to filter licenses
}

export const Licenses = ({ setSelectedLicense, beatId }: LicensesProps) => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [selected, setSelected] = useState<License | null>(null);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await fetch(`${baseURL}/api/licenses?beatId=${beatId}`);
        if (response.ok) {
          const data = await response.json();
          setLicenses(data);
          if (data.length > 0) {
            const defaultLicense = data[0]; // Set the first license as the default selection
            setSelected(defaultLicense);
            setSelectedLicense(defaultLicense); // Pass the default license to the parent component
          }
        } else {
          console.error('Failed to fetch licenses');
        }
      } catch (error) {
        console.error('Error fetching licenses:', error);
      }
    };

    fetchLicenses();
  }, [setSelectedLicense, beatId]);

  useEffect(() => {
    // Whenever selected license changes, pass it back to the parent
    if (selected) {
      setSelectedLicense(selected);
    }
  }, [selected, setSelectedLicense]);

  return (
    <div className="px-4">
      <div className="mx-auto max-w-xs min-w-64">
        <RadioGroup value={selected} onChange={setSelected} aria-label="Beat License" className="space-y-2">
          {licenses.map((license) => (
            <Radio
              key={license.id}
              value={license}
              className="group relative flex cursor-pointer rounded-lg bg-white/5 py-3 px-5 text-white shadow-md transition focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white/10"
            >
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