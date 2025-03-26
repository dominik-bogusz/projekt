import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { Book } from '../types/book';
import { Button, Modal, Textarea } from 'flowbite-react';
import { HiOutlineSwitchHorizontal } from 'react-icons/hi';

interface BookExchangeButtonProps {
  book: Book;
  ownerId: string;
}

const BookExchangeButton: React.FC<BookExchangeButtonProps> = ({ book, ownerId }) => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleExchangeRequest = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Najpierw sprawdzamy czy już istnieje prośba o wymianę
      const { data: existingRequest } = await supabase
        .from('exchange_requests')
        .select('*')
        .eq('requester_id', user.id)
        .eq('book_id', book.id)
        .eq('owner_id', ownerId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        alert('Już wysłałeś prośbę o wymianę tej książki!');
        setShowModal(false);
        setIsLoading(false);
        return;
      }

      // Dodajemy nową prośbę
      const { error } = await supabase.from('exchange_requests').insert([
        {
          requester_id: user.id,
          book_id: book.id,
          owner_id: ownerId,
          status: 'pending',
          message: message,
        },
      ]);

      if (error) throw error;

      // Wysyłamy powiadomienie
      await supabase.from('notifications').insert([
        {
          user_id: ownerId,
          type: 'exchange_request',
          content: `Użytkownik chce wymienić się z Tobą książką "${book.title}"`,
          is_read: false,
        },
      ]);

      alert('Prośba o wymianę została wysłana!');
      setShowModal(false);
    } catch (error) {
      console.error('Błąd podczas wysyłania prośby o wymianę:', error);
      alert('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  // Nie pokazujemy przycisku, jeśli to nasza książka
  if (user?.id === ownerId) return null;

  return (
    <>
      <Button 
        size="sm" 
        color="purple" 
        onClick={() => setShowModal(true)}
        className="mt-2 flex items-center"
      >
        <HiOutlineSwitchHorizontal className="mr-2" />
        Wymiana
      </Button>

      <Modal 
        show={showModal} 
        onClose={() => setShowModal(false)}
        size="md"
      >
        <Modal.Header>
          Poproś o wymianę książki
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="flex mb-4">
              <img 
                src={book.imageLinks?.thumbnail || "https://via.placeholder.com/128x192?text=Brak+Okładki"} 
                alt={book.title}
                className="w-20 h-30 object-cover rounded mr-4"
              />
              <div>
                <h5 className="text-lg font-medium">{book.title}</h5>
                <p className="text-sm text-gray-600">
                  {book.authors ? book.authors.join(', ') : 'Nieznany autor'}
                </p>
              </div>
            </div>

            <p className="text-sm">
              Dodaj krótką wiadomość do właściciela książki:
            </p>
            
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cześć! Chciałbym wypożyczyć/wymienić się tą książką..."
              rows={4}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)} color="gray">
            Anuluj
          </Button>
          <Button 
            onClick={handleExchangeRequest} 
            disabled={isLoading}
            color="purple"
          >
            {isLoading ? 'Wysyłanie...' : 'Wyślij prośbę'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BookExchangeButton;