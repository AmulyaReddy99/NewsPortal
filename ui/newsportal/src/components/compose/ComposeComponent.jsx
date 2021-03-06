import { Button } from 'react-bootstrap';
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import './ComposeComponent.scss'

const ComposeComponent = () => {

    const [show, setShow] = useState(false);
    const [title, setTitle] = useState("");
    const [article_text, setArticleText] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSave = () => {
        fetch('http://localhost:8090/article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "article": article_text
            })
        }).then(response => response.json())
        .then(
            result => {
                console.log(result.body)
                fetch('http://localhost:8090/article/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                            article : {
                            articleName: title,
                            composer: localStorage.getItem("username"),
                            approvedDate: new Date().toString(),
                            approvedBy: localStorage.getItem("username"),
                            lastUpdatedDate: new Date().toString(),
                            articleText: article_text,
                            processInstanceId: result.id
                        }
                    })
                })
            }
        )
        setShow(false);
    }

    const onTitleChange = (e) => { setTitle(e.target.value) }
    const onArticleChange = (e) => { setArticleText(e.target.value) }

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
                    <textarea onChange={(e)=>onArticleChange(e)}/>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
 
export default ComposeComponent;