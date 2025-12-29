import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { verify } from '../api/authAPI'

const VerifyEmail = () => {
    let [message, setMessage] = useState('')
    let [error, setError] = useState('')

    let { token } = useParams()

    useEffect(() => {
        verify(token)
            .then(data => {
                if (data.success) {
                    setMessage(data.message)
                    setError('')
                }
                else {
                    setError(data.error)
                    setMessage('')
                }
            })
    }, [])

    return (
        <div className={`h-[80vh] flex justify-center items-center text-3xl 
        ${error ? 'text-red-500' : 'text-green-500'}`}>
            {error}
            {message}
        </div>
    )
}

export default VerifyEmail