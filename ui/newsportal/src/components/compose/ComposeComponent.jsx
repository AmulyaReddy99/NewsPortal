import { Button } from 'react-bootstrap';
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import './ComposeComponent.scss'

const ComposeComponent = () => {

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (  
        <>
            <div class="compose">
                <input className="article-title-input" placeholder="Article Title"/>
                <Button variant="primary" onClick={handleShow}>Compose</Button>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Article Title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <textarea/>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
 
export default ComposeComponent;