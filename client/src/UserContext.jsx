import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({})

export const UserContextProvider = ({ children}) => {
    const [ username, setUsername ] = useState(null)
    const [ id, setId ] = useState(null)

    useEffect(() => {
        axios.get('/api/profile').then( response => {
            setId(response.data.userId)
            setUsername(response.data.username)
        }).catch(e => {
            console.log('User is not logged in, log in to view profile')
        })
    }, [])

    return(
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    )
}