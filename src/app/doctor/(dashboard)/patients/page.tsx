'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { mockPatientsList } from '@/data/patientsData';
import { getAgeFromDob, getPrimaryImage, resolveValue, usePatients } from '@/src/hooks/usePatients';

export default function DoctorPatientsPage() {
  const { patients, isLoadingPatients, patientsError, fetchPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    const rosterPatients = patients.map((patient) => {
      const mockPatient = mockPatientsList.find((item) => item.id === patient.id) ?? mockPatientsList[0];
      const computedAge = patient.date_of_birth ? getAgeFromDob(patient.date_of_birth) : null;
      const avatarSource = getPrimaryImage(patient, '');

      return {
        ...mockPatient,
        id: patient.id,
        name: resolveValue(patient.full_name, mockPatient.name),
        avatar: avatarSource,
        age: computedAge !== null && computedAge !== undefined ? computedAge : mockPatient.age,
        gender: resolveValue(patient.gender, mockPatient.gender),
        bloodType: resolveValue(patient.blood_group, mockPatient.bloodType),
        visitsCount: mockPatient.visitsCount,
        lastVisit: mockPatient.lastVisit,
        nextAppointment: mockPatient.nextAppointment,
      };
    });

    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return rosterPatients;
    }

    return rosterPatients.filter((patient) =>
      patient.name.toLowerCase().includes(query) ||
      patient.bloodType.toLowerCase().includes(query) ||
      patient.gender.toLowerCase().includes(query) ||
      patient.condition.toLowerCase().includes(query)
    );
  }, [patients, searchTerm]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-normal text-slate-900">Patients</h1>
          <p className="text-sm md:text-md text-slate-700 font-normal mt-0.5">
            {isLoadingPatients ? 'Loading patients...' : `${filteredPatients.length} registered patients`}
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white rounded-xl border border-slate-300 text-sm md:text-md text-slate-800 placeholder:text-slate-700 focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none shadow-2xs transition-all font-normal"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs space-y-3.5">
        {patientsError ? (
          <div className="py-12 text-center text-rose-500 text-sm font-normal">
            {patientsError}
          </div>
        ) : isLoadingPatients ? (
          <div className="py-12 text-center text-slate-400 text-sm font-normal">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-normal">
            No patients match &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <Link
              key={patient.id}
              href={`/doctor/patients/${patient.id}`}
              className="group bg-[#f8f8fa] hover:bg-[#f0f0f4] transition-all p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100 hover:border-slate-200 cursor-pointer block"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-100 shrink-0 bg-slate-200 flex items-center justify-center text-slate-700 font-medium text-sm">
                  {patient.avatar ? (
                    <Image
                      src={patient.avatar}
                      alt={patient.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{patient.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <h3 className="text-md md:text-base font-normal text-slate-900 group-hover:text-[#0149ff] transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-slate-600 font-normal mt-0.5">
                    {patient.gender}, {patient.age} · {patient.bloodType} · {patient.visitsCount} visits
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50">
                <div className="text-left sm:text-right">
                  <span className="block text-[14px] text-slate-600 font-normal tracking-wider">
                    Last Visit
                  </span>
                  <span className="text-md md:text-md font-normal text-slate-900 mt-0.5 block">
                    {patient.lastVisit}
                  </span>
                </div>

                <div className="text-left sm:text-right min-w-[110px]">
                  <span className="block text-[14px] text-slate-700 font-normal tracking-wider">
                    Next Appointment
                  </span>
                  <span className="text-md md:text-md font-normal text-slate-900 mt-0.5 block">
                    {patient.nextAppointment}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0 ml-1" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
