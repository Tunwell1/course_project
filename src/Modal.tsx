import { useEffect } from 'react'
import './CSS/modal.css'
import { ModalProps } from './types'

export const Modal: React.FC<ModalProps> = ({ setIsModalOpen, column }) => {
    useEffect(() => {
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") setIsModalOpen(false)
        })
    })

    return (
        <div className="modal" onClick={() => setIsModalOpen(false)}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <span className='header'>Фильтрация по столбцу "{column}"</span>
            </div>
        </div>
    )
}