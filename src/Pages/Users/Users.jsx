import React, { useEffect,useState } from 'react'
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaTrashAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { css } from '@emotion/react';
import { ClipLoader } from 'react-spinners';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';


const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Users = () => {

    const [users, setUsers] = useState([]);
    const [openCreateUserModal, setOpenCreateUserModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openDeleteBulkModal, setOpenDeleteBulkModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [email , setEmail] = useState('')
    const [searchQuery, setSearchQuery] = useState('');
    const [loading , setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10; 
    const [selectDeleteUser, setSelectDeleteUser] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleCheckboxChange = (user) => {
        if (selectDeleteUser.includes(user)) {
          setSelectDeleteUser(selectDeleteUser.filter((selectedUser) => selectedUser !== user));
        } else {
          setSelectDeleteUser([...selectDeleteUser, user]);
        }
      };
    
      const handleSelectAll = () => {
        if (selectAll) {
          setSelectDeleteUser([]);
        } else {
          setSelectDeleteUser(displayedUsers);
        }
        setSelectAll(!selectAll);
      };

      const handleMultiDelete = async () => {
        console.log('Selected Users:', selectDeleteUser);
        try {
            const response = await axios.post(`http://localhost:5000/users/bulk-delete`, {
                data: selectDeleteUser.map((user) => String(user._id)),
            });
            if (response.status === 200) {
                toast.success('Users deleted successfully');
                getUsers();
            } else {
                toast.error('Failed to delete users');
            }
            setSelectDeleteUser([]);
            setSelectAll(false);
            setOpenDeleteBulkModal(false);
        } catch (error) {
            console.error('Error deleting users:', error);
            toast.error('Failed to delete users');
        }
    };
    

    const getUsers = async () => {
        const response = await axios.get('http://localhost:5000/users');
        setUsers(response.data);
    }

    useEffect(() => {
        getUsers().then(() => setLoading(false));
        console.log(users);
    },[])

     // Filter users based on search query
     const filteredUsers = users.filter((user) =>
     user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     String(user.id).toLowerCase().includes(searchQuery.toLowerCase())
   );
   

// Calculate the total number of pages based on the filtered users and items per page
const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

// Slice the array to display only the current page's items
const displayedUsers = filteredUsers.slice(
  currentPage * itemsPerPage,
  (currentPage + 1) * itemsPerPage
);

// Handle page change
const handlePageChange = ({ selected }) => {
  setCurrentPage(selected);
};

// Handle search input change
const handleSearchChange = (e) => {
  setSearchQuery(e.target.value);
  setCurrentPage(0); // Reset to the first page when the search query changes
};

    const validationSchema = () =>
  Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Invalid email')
      .required('Email is required')
      .test('email-unique', 'Email already exists', async function (value) {
        // Check if the email already exists in the database, excluding the current user
        if (value !== selectedUser?.email) {
          const response = await fetch(`http://localhost:5000/users/check-email/${value}`);
          const data = await response.json();
          return data.isUnique;
        }
        return true; // Email is the same as the current user's, so it's considered unique
      }),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

      const initialValues = {
        name: selectedUser ? selectedUser.name : '',
        email: selectedUser ? selectedUser.email : '',
        password: selectedUser ? selectedUser.password : '',
      };

      const deleteUser = async () => {
        try {
            const response = await axios.delete(`http://localhost:5000/users/${selectedUser._id}`);
            if (response.status === 200) {
                toast.success('User deleted successfully');
                getUsers();
                setOpenDeleteModal(false);
                setSelectedUser(null);
                setEmail('');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
      }
    
      const handleSubmit = async (values) => {
        try {
            const response = await axios.post('http://localhost:5000/users', values);
            console.log(response);
            if (response.status === 200) {
                toast.success('User created successfully');
                setOpenCreateUserModal(false);
                getUsers();
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleUpdate = async (values) => {
        try {
            const response = await axios.put(`http://localhost:5000/users/${selectedUser._id}`, values);
            console.log(response);
            if (response.status === 200) {
                toast.success('User updated successfully');
                setOpenCreateUserModal(false);
                setSelectedUser(null);
                getUsers();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };


    

  return (
    <div>    

        {/* model */}

        {openCreateUserModal && (
            
       
            <div id="authentication-modal" tabindex="-1" aria-hidden="true" class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center h-screen">
            <div class="relative p-4 w-full max-w-md">
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            {selectedUser !== null ? 'Edit User' : 'Create User'}
                        </h3>
                        <button type="button" onClick={() =>{ setOpenCreateUserModal(false); setSelectedUser(null); }} class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div class="p-4 md:p-5">
                  <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={
        selectedUser !== null ? handleUpdate : handleSubmit
    }
    >
      <Form class="space-y-4">
        <div>
          <label htmlFor="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your name</label>
          <Field type="text" id="name" name="name" placeholder="Your name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"/>
          <ErrorMessage name="name" component="div"  className='text-red-500'/>
        </div>

        <div>
          <label htmlFor="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
          <Field type="email" id="email" name="email" placeholder="Your email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" />
          <ErrorMessage name="email" component="div" className='text-red-500' />
        </div>

{selectedUser === null && (
    

        <div>
          <label htmlFor="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
          <Field type="password" id="password" name="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" />
          <ErrorMessage name="password" component="div" className='text-red-500' />
        </div>
        )}

        <button type="submit" class="w-full mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        {selectedUser !== null ? 'Update User' : 'Create User'}
            </button>
      </Form>
    </Formik>
            </div>
                </div>
            </div>
             </div>
        

        )}

        {/* end model */}


        {/* delete modal */}
        {openDeleteModal && (
            
     
            <div id="authentication-modal" tabindex="-1" aria-hidden="true" class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center h-screen">
    <div class="relative p-4 w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button onClick={() => {setOpenDeleteModal(false); setEmail(''); setSelectedUser(null)}} type="button" class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span class="sr-only">Close modal</span>
            </button>
            <div class="p-4 md:p-5 text-center">
                <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete this user?
                </h3>
                <div>
                    <input type='email' value={email} placeholder='Please verify your email' onChange={(e) => setEmail(e.target.value)} className='text-gray-500 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white' />
                </div>
               
                        <button onClick={() => deleteUser()} {...{disabled: email !== selectedUser?.email}} data-modal-hide="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2">
                        Yes, I'm sure
                    </button>
              
            
                <button onClick={() => {setOpenDeleteModal(false); setEmail(''); setSelectedUser(null)}} data-modal-hide="popup-modal" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">No, cancel</button>
            </div>
        </div>
    </div>
</div>
   )}
        {/* end delete modal */}



         {/* delete modal */}
         {openDeleteBulkModal && (
            
     
            <div id="authentication-modal" tabindex="-1" aria-hidden="true" class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center h-screen">
    <div class="relative p-4 w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button onClick={() => {setOpenDeleteBulkModal(false); setSelectDeleteUser([]); }} type="button" class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span class="sr-only">Close modal</span>
            </button>
            <div class="p-4 md:p-5 text-center">
                <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete {selectDeleteUser.length} users?
                </h3>
              
               
                        <button onClick={() => {handleMultiDelete()}}  data-modal-hide="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2">
                        Yes, I'm sure
                    </button>
              
            
                <button onClick={() => {setOpenDeleteBulkModal(false); setSelectDeleteUser([]); }} data-modal-hide="popup-modal" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">No, cancel</button>
            </div>
        </div>
    </div>
</div>
   )}
        {/* end delete modal */}


        <section class="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 h-screen">
        <div>
        <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Users</h1>
        </div>
    <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
        <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div class="w-full md:w-1/2">
                    <form class="flex items-center">
                        <label for="simple-search" class="sr-only">Search</label>
                        <div class="relative w-1/2">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <input   value={searchQuery}
        onChange={handleSearchChange} type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search..." required=""/>
                        </div>
                    </form>
                </div>
                <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                  
                    <div class="flex items-center space-x-3 w-full md:w-auto">
                        <button id="actionsDropdownButton" data-dropdown-toggle="actionsDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
                            <svg class="-ml-1 mr-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                            Actions
                        </button>
                        <div id="actionsDropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                            <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="actionsDropdownButton">
                                <li>
                                    <button onClick={()=>setOpenCreateUserModal(true)} class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left">Create</button>
                                </li>
                                { selectDeleteUser.length > 0 && (
                                    
                               
                                <li>
                                    <button onClick={()=>setOpenDeleteBulkModal(true)} class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left">Delete All</button>
                                </li>
                                 )}
                            </ul>
                            
                         
                        </div>
                       
                    </div>
                </div>
            </div>
           
           {loading ? (
             <ClipLoader color={'black'} loading={loading} css={override} size={50} />
           ):(
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                        <th scope="col" className="px-4 py-3">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectAll}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </th>
                        <th scope="col" class="px-4 py-3">#</th>
                            <th scope="col" class="px-4 py-3">Name</th>
                            <th scope="col" class="px-4 py-3">Email</th>
                        
                            <th scope="col" class="px-4 py-3 flex items-center justify-end">
                               Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedUsers.map((user,index) => (
                            
                      
                        <tr key={index} class="border-b dark:border-gray-700">
                             <td class="px-4 py-3">
                             <input
                                type="checkbox"
                                onChange={() => handleCheckboxChange(user)}
                                checked={selectDeleteUser.includes(user)}
                                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </td>
                             <td class="px-4 py-3">{index+1}</td>
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.name}</th>
                            <td class="px-4 py-3">{user.email}</td>
                       
                            <td class="px-4 py-3 flex items-center justify-end">
                       
                            <MdEdit size={20} onClick={()=>{setOpenCreateUserModal(true); setSelectedUser(user)}} className='cursor-pointer mr-2' />
                            <FaTrashAlt size={20} onClick={()=>{setOpenDeleteModal(true); setSelectedUser(user)}} className='cursor-pointer mr-2' />
                            </td>
                        </tr>

                        ))}
                     
                    </tbody>
                </table>
           )}
           
           {loading !== true && (
             
                <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
                <ReactPaginate
                previousLabel="Previous"
                nextLabel="Next"
                breakLabel="..."
                pageCount={pageCount}
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
    </div>
    </section>
    </div>
  )
}

export default Users