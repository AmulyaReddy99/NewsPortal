import { Button } from 'react-bootstrap';
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import './ComposeComponent.scss'

const ComposeComponent = () => {

    const [show, setShow] = useState(false);
    const [title, setTitle] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSave = () => {
        fetch('http://localhost:8090/article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "article": "This article is about the political riots going on"
            })
        }).then(
            res => console.log(res)
        )
        setShow(false);
    }
    const handleSubmit = () => {
        // handleSave();
        fetch('http://localhost:8090/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "article": "This article is about the political riots going on"
            })
        }).then(
            res => console.log(res)
        )
        setShow(false);
    }

    const onTitleChange = (e) => { setTitle(e.target.value) }

    return (  
        <>
            <div className="compose">
                <input className="article-title-input" onChange={(e)=>onTitleChange(e)} placeholder="Article Title"/>
                <Button variant="primary" onClick={handleShow}>Compose</Button>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>{title!==""? title: "Article Title"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <textarea/>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit Article
                </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
 
export default ComposeComponent;