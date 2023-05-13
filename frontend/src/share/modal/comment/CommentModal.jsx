import { Box, Button, Card, Modal, TextField } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useKeyDown } from '../../../hooks/useKeyDown';
import CommentCard from './components/CommentCard';
import Axios from '../../AxiosInstance';
import { AxiosError } from 'axios';
import GlobalContext from '../../Context/GlobalContext';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const CommentModal = ({ open = false, handleClose = () => {}}) => {
  const [textField, setTextField] = useState('');
  const [comments, setComments] = useState([]);
  const {setStatus} = useContext(GlobalContext);
  const [error, setError] = useState("");

  const precisionRemove = (id) => {
    setComments(comments.filter(c => c.id != id));
  }

  const precisionUpdate = (id, message) => {
    setComments(comments.map(c => c.id === id ? {...c, msg: message} : c));
  }

  useKeyDown(() => {
    handleAddComment();
  }, ['Enter']);

  //use effect
  useEffect(() => {
    // TODO: Implement get notes by user's token
    // 1. check if user is logged in
    const userToken = Cookies.get('UserToken');
    console.log(userToken);
    if (userToken !== undefined && userToken !== 'undefined') {
      // 2. call API to get notes
      Axios.get('/comment', { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
        // 3. set comment to state
        const comments = res.data.data.map((comment) =>({
          id:comment.id,
          msg:comment.text,
        }));
        setComments(comments);
      });
    }
  }, []);

  //validate form
  const validateForm = () =>{
    let isValid = true;
    if(!textField){
      console.log("the text is required");
      isValid = false;
    }
    return isValid;
    
  }
  const handleAddComment = async() => {
    
    try{
      if(!validateForm()) return;
      // 2. call API to create note
    const userToken = Cookies.get('UserToken');
    const response = await Axios.post('/comment', {text: textField}, {
      headers: {Authorization : `Bearer ${userToken}`},
    }
    );
      if(response.data.success){
        // TODO implement logic
        setComments([...comments, { id: Math.random(), msg: textField }]);
        //setComments((prev) => [...prev, response.data.data]);
        handleClose();
        setStatus({
          msg : response.data.msg,
          severity: 'success'
        });
      }
    }catch(error){
      setTextField('');
      //check if e are AxiosError
      if(error instanceof AxiosError){
        //check if e.response exit
        if(error.response)
        return setStatus({
          msg: error.response.data.error,
          severity: 'error',
        });
        //if e is not AxiosError or response doesn't exist, return error message
        return setStatus({
          msg: error.message,
          severity: 'error',
        });
      }
    }
    
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Card
        sx={{
          width: { xs: '60vw', lg: '40vw' },
          maxWidth: '600px',
          maxHeight: '400px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '16px',
          backgroundColor: '#ffffffCC',
          p: '2rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <TextField
            value={textField}
            onChange={(e) => setTextField(e.target.value)}
            fullWidth
            placeholder="Type your comment"
            variant="standard"
          />
          <Button onClick={handleAddComment}>Submit</Button>
        </Box>
        <Box
          sx={{
            overflowY: 'scroll',
            maxHeight: 'calc(400px - 2rem)',
            '&::-webkit-scrollbar': {
              width: '.5rem', // chromium and safari
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#999999',
              borderRadius: '10px',
            },
          }}
        >
          {comments.map((comment) => (
            <CommentCard comment={comment} key={comment.id}  removeComment={precisionRemove} updateComment={precisionUpdate}/>
          ))}
        </Box>
      </Card>
    </Modal>
  );
};

export default CommentModal;
