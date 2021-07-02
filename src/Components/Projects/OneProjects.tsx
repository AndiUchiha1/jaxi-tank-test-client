import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ADD_PROYECT_MEMBER, GET_ONE_PROYECT, UPDATE_PROYECT } from '../../Queries';
import Navigation from '../Navigation';
import { PlusCircleIcon } from '@heroicons/react/outline';
import AddProyectMember from './AddProyectMember';
import toast, { Toaster } from 'react-hot-toast';
import EditProyectForm from './EditProyectForm';

const OneProjects = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [token] = useState<string | any>(localStorage.getItem('token'));
  const [email, setEmail] = useState<string | null>('');
  const [role, setRole] = useState<string | null>('');
  const params: any | undefined = useParams();
  const proyectId: any | string = params?.projectId;

  const { data, refetch } = useQuery(GET_ONE_PROYECT, {
    variables: { token, proyectId },
    fetchPolicy: "network-only",
  });

  const [addProyectMember] = useMutation(ADD_PROYECT_MEMBER, {
    onCompleted: (data) => checkErrors(data)
  });

  const handleAddProyectMemberClick = async () => {
    await addProyectMember({ variables: { email, role, token, proyectId } });
  }

  let [title, setTitle] = useState<string | undefined>('');
  let [startAt, setStartAt] = useState<string | undefined>('');
  let [endsAt, setEndsAt] = useState<string | undefined>('');

  const [updateProyect] = useMutation(UPDATE_PROYECT, {
    onCompleted: (data) => checkUpdateProyectErrors(data)
  })

  const handleEditClick = async () => {
    console.log(title, startAt, endsAt);
    await updateProyect({ variables: { token, proyectId, title, startAt, endsAt } });
  }


  const handleInputChange = ({ target }: any) => {
    const { value, name } = target;
    if (name === 'email') {
      setEmail(value);
    }
    if (name === 'role') {
      setRole(value);
    }
    if (name === 'title') {
      setTitle(value);
    }
    if (name === 'startAt') {
      setStartAt(value);
    }
    if (name === 'endsAt') {
      setEndsAt(value);
    }
  }

  const checkErrors = async (data: any) => {
    if (data?.addMember?.err || data.addMember?.memberHasAdded === false) {
      toast.error(`${data?.addMember?.err?.errorDesc}`, { duration: 2300, });
    } else if (data.addMember?.memberHasAdded === true) {
      toast.success('Member Added');
      await refetch();
      setOpen(false);
    }
  }

  const checkUpdateProyectErrors = async (data: any) => {
    if (data?.editProyect?.err || data.editProyect?.proyectHasUpdated === false) {
      toast.error(`${data?.editProyect?.err?.errorDesc}`, { duration: 2300, });
    } else if (data.editProyect?.proyectHasUpdated === true) {
      toast.success('Proyect Updated');
      await refetch();
      setOpenEdit(false);
    }
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <Navigation />
      <AddProyectMember open={open} setOpen={setOpen} handleInputChange={handleInputChange} handleAddProyectMemberClick={handleAddProyectMemberClick} />
      <section className="w-full max-w-6xl px-4 m-4 mx-auto">
        <div className="grid gap-5 p-4 m-2 md:grid-cols-12">
          <main className="p-4 md:col-span-9">
            <div className="flex flex-row mx-auto">
              <h1 className="text-3xl">
                {data?.getOneProyect?.proyect?.title}
              </h1>
              <button
                onClick={() => setOpenEdit(true)}
                className="p-2 mx-auto font-medium text-white duration-300 ease-in-out transform bg-blue-600 rounded-md hover:bg-blue-700 ransition">
                Edit Project
              </button>
            </div>
            <section className="text-gray-700 ">
              <div className="container items-center px-5 py-8 mx-auto">
                <div className="flex flex-wrap mb-12 text-left">
                  {data?.getOneProyect?.proyect?.tasks.length === 0 ? <p>No Tasks yet</p> : data?.getOneProyect?.proyect?.tasks?.map((task: any) => (
                    <div className="w-full mx-auto my-4 bg-gray-100 rounded-xl" key={task?.id}>
                      <div className="p-6">
                        <h1 className="mx-auto mb-4 text-2xl font-semibold leading-none tracking-tighter text-black lg:text-3xl"> {task?.title} </h1>
                        <h2 className="px-2 mb-4 text-2xl font-medium text-black">{task?.status}</h2>
                        <h2 className="mx-auto mb-2 font-medium leading-none tracking-tighter text-black text-md lg:text-2xl">Task Members</h2>
                        {task?.members?.length === 0 ? <p> No Members yet </p> : task?.members?.map((member: any) => (
                          <div className="flex flex-col transition duration-200 ease-in-out transform rounded-lg hover:bg-gray-300" key={member?.id}>
                            <div className="flex flex-row p-3">
                              <img src={member?.avatar} alt={member?.email} className="mt-1 border-2 border-black border-opacity-75 h-11 w-11 rounded-xl" />
                              <p className="px-3 pt-2 mt-1">{member?.email}</p>
                            </div>
                          </div>
                        ))}
                        <Link to={`/tasks/${task?.id}`}>
                          <button name={task?.id} className="w-full px-16 py-2 mt-4 font-medium text-white transition duration-500 ease-in-out transform bg-black border-black rounded-md text-md focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:bg-blueGray-900">View more</button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
          <aside className="w-full p-2 md:col-span-3 md:pt-0">
            <h1 className="mb-2 font-medium lg:text-3xl">Project Members</h1>
            <div className="flex flex-col">
              {data?.getOneProyect?.proyect?.members?.map((member: any) => (
                <div className="flex flex-row w-full my-3 transition duration-200 ease-in-out transform bg-gray-200 rounded-xl hover:bg-gray-300" key={member?.id}>
                  <div className="flex flex-col items-center p-3 mx-auto text-center">
                    <img src={member?.avatar} alt={`${member?.email}: ${member?.role}`} className="my-2 border-2 border-black border-opacity-75 rounded-xl h-9 w-9 lg:h-12 lg:w-12" />
                    <p className="">{member?.email}</p>
                  </div>
                </div>
              ))}
              <div className="flex flex-row w-full my-3">
                <div className="flex flex-col items-center p-3 mx-auto text-center">
                  <button
                    onClick={() => setOpen(true)}
                    className="transition duration-300 ease-in-out transform rounded-full focus:ring-2 ring-gray-400 ring-offset-gray-400 ring-offset-2 focus:outline-none focus:shadow-outline">
                    <PlusCircleIcon className="w-20 h-20 p-0 m-0 text-gray-300 transition duration-200 ease-in-out hover:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <EditProyectForm
        data={data}
        open={openEdit}
        handleInputChange={handleInputChange}
        handleEditClick={handleEditClick}
        setOpen={setOpenEdit}
        token={token}
        proyectId={proyectId}
      />
    </>
  );
}

export default OneProjects;
