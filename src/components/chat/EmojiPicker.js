import React, { useState } from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const EmojiPicker = ({ onSelect }) => {
    const [show, setShow] = useState(false);
    
    // Common emojis
    const emojis = [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
        '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
        '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
        '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝',
        '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁',
        '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩',
        '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡',
        '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠',
        '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈',
        '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',
        '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
        '💋', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
        '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
        '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏',
        '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂',
        '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄'
    ];

    const handleEmojiClick = (emoji) => {
        onSelect({ native: emoji });
        setShow(false);
    };

    return (
        <>
            <Button 
                variant="link" 
                onClick={() => setShow(true)}
                title="Emoji"
            >
                😀
            </Button>

            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select Emoji</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Row>
                        {emojis.map((emoji, index) => (
                            <Col xs={2} key={index} className="text-center mb-2">
                                <Button 
                                    variant="link" 
                                    onClick={() => handleEmojiClick(emoji)}
                                    style={{ fontSize: '24px' }}
                                >
                                    {emoji}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default EmojiPicker;