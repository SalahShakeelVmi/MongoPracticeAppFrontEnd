import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaTrashAlt } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import { css } from '@emotion/react';
import { ClipLoader } from 'react-spinners';
import ReactPaginate from 'react-paginate';

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { Page, Text, View, Document, StyleSheet, PDFViewer, Link } from '@react-pdf/renderer';

const Users2 = () => {
  const [usersData, setUsersData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 10; // Adjust the page size as needed

  const [dateModal, setDateModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const fetchData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:5000/users?page=${page}&search=${searchQuery}`);
      const data = response.data;

      setUsersData(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users data:', error);
      setLoading(false);
    }
  };
  
  const fetchDateData = async (page) => {
    try {
      const start = state[0].startDate.toISOString().substring(0, 10);
      const end = state[0].endDate.toISOString().substring(0, 10);
      const response = await axios.get(`http://localhost:5000/users?page=${page}&search=${searchQuery}&startDate=${start}&endDate=${end}`);
      const data = response.data;
      setUsersData(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching users data:', error);
      setLoading(false);
    }
  };


  const handlePageChange = (selectedPage) => {
    fetchData(selectedPage.selected + 1);
  };

  useEffect(() => {
    fetchData(1);
  }, [searchQuery]); // Fetch data for the first page when the component mounts

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [state, setState] = useState([
    {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
    },
]);

const toggleDatePicker = () => {
    setIsDatePickerVisible(!isDatePickerVisible);
    fetchDateData(1);
};

const handleDateChange = (item) => {
  setState([item.selection]);
};


const selectDate = () => {
    if (state[0].startDate != state[0].endDate) {
   
        toggleDatePicker();
         setDateModal(false);
         setState([
             {
                 startDate: new Date(),
                 endDate: new Date(),
                 key: "selection",
             }
         ])
    }
};


const generatePDF = (data) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>User Data</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {Object.keys(data[0]).map((key) => (
              <View key={key} style={styles.tableHeaderCell}>
                <Text style={styles.cell}>{key}</Text>
              </View>
            ))}
          </View>
          {data.map((user) => (
            <View key={user._id} style={styles.tableRow}>
              {Object.keys(user).map((key) => (
                <View key={key} style={styles.tableCell}>
                  <Text style={styles.cell}>{user[key]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

const handleDownloadPDF = () => {
   generatePDF(usersData);
  
};

const pdfToBlob = (pdf) => {
  const blobParts = [pdf];
  return new Blob(blobParts, { type: 'application/pdf' });
};


const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#D3D3D3',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  cell: {
    fontSize: 12,
  },
});


  return (
    <div>


{dateModal && (
  

<div id="authentication-modal" tabindex="-1" aria-hidden="true" class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 bottom-0 left-0 z-50 justify-center items-center w-full h-screen">
    <div class="relative p-4 w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Select Date Range
                </h3>
                <button type="button" onClick={() => setDateModal(false)} class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <div class="p-4 md:p-5">
            <DateRange
                       
                        editableDateInputs={true}
                        onChange={handleDateChange}
                        moveRangeOnFirstSelection={false}
                        ranges={state}
                        direction="horizontal"
                    />
                    
                     <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={selectDate}>Select Date</button>
                  
                     
            </div>
           
        </div>
    </div>
</div>

)}

      {loading ? (
        <ClipLoader color={'#123abc'} loading={loading} css={css} size={150} />
      ) : (
        <div>
             <button onClick={handleDownloadPDF} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>PDF</button>
               <button onClick={()=>fetchData(1)} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Reset</button>
            <button onClick={()=>setDateModal(true)} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Dange Range</button>
            <input type="text" placeholder="Search" onChange={(e) => setSearchQuery(e.target.value)} />
          {/* Display your user data here */}
          <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {usersData.map((user) => (
                    
               
                <tr>
                    <td>{user.name}</td>
                    <td>{user.date}</td>
                </tr>
                 ))}
            </tbody>
          </table>


        

          {totalPages > 1 && (
            <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
              <ReactPaginate
                previousLabel="Previous"
                nextLabel="Next"
                breakLabel="..."
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName="flex flex-wrap justify-center pagination items-center"
                pageClassName="mx-1"
                pageLinkClassName="px-3 py-1 border text-grey-500"
                activeClassName="font-bold "
                previousClassName="mr-2 px-3 py-1 border text-grey-500"
                nextClassName="ml-2 px-3 py-1 border text-grey-500"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </nav>
          )}
        </div>
      )}

      <div className='w-1/2 mb-10'>
      <PDFViewer style={{ width: '100%', height: '500px' }}>
        {generatePDF(usersData)}
      </PDFViewer>
      </div>
    </div>
  );
};

export default Users2;
