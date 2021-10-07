import React from "react";
import Header from "./Header";
import Main from "./main/Main";
import Footer from "./Footer";
import ImagePopup from "./popups/ImagePopup";
import PopupWithForm from "./popups/PopupWithForm";
import EditProfilePopup from "./popups/EditProfilePopup";
import EditAvatarPopup from "./popups/EditAvatarPopup";
import AddPlacePopup from "./popups/AddPlacePopup";
import ErrorPopup from "./popups/ErrorPopup";
import { api } from "../utils/Api";
import { CurrentUserContext } from "../context/CurrentUserContext";
import Spinner from "./Spinner";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false),
      [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false),
      [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false),
      [isDeleterPopupOpen, setIsDeleterPopupOpen] = React.useState(false),
      [isErrorPopupOpen, setIsErrorPopupOpen] = React.useState(false),
      [isPageLoaded, setIsPageLoaded] = React.useState(false),
      [errorMassage, setErrorMassage] = React.useState(''),
      [selectedCard, setSelectedCard] = React.useState({name: '', link: ''}),
      [currentUser, setCurrentUser] = React.useState({}),
      [cards, setCards] = React.useState([]);

  React.useEffect(() => {
    Promise.all([
        api.getUserInfo(),
        api.getInitialCards()
    ])
        .then(([userInfo, cards]) => {
          setCurrentUser(userInfo);
          setCards(cards);
        })
        .catch(err => {
          setErrorMassage(err);
          setIsErrorPopupOpen(true);
        })
        .finally(() => {
          setTimeout(showContent, 2000)
        })
  }, [])

  const showContent = () => {
    setIsPageLoaded(true)
  }

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  }

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  }

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  }

  const handleCardClick = (card) => {
    setSelectedCard(card)
  }

  const handleDeleterClick = () => {
    setIsDeleterPopupOpen(true);
  }

  const  handleUpdateUser = (userInfo) => {
    api.setUserInfo(userInfo)
        .then((userInfo) => {
          setCurrentUser(userInfo)
          closeAllPopups()
        })
        .catch(err => {
          setErrorMassage(err);
          setIsErrorPopupOpen(true);
        })
  }

  const handleUpdateAvatar = (avatarUrl) => {
    api.setAvatar(avatarUrl)
        .then(userInfo => {
          setCurrentUser(userInfo);
          closeAllPopups();
        })
        .catch(err => {
          setErrorMassage(err);
          setIsErrorPopupOpen(true);
        })
  }

  const handleErrorAccess = () => {
    closeAllPopups()
  }

  const closeAllPopups = () => {
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsDeleterPopupOpen(false);
    setSelectedCard({name: '', link: ''})
  }

  React.useEffect(() => {
    const closeByEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllPopups()
      }
    }

    document.addEventListener('keydown', closeByEscape);

    return () => document.removeEventListener('keydown', closeByEscape);
  }, [])

  const handleCardLike = (card) => {
    const isLiked = card.likes.some(like => like._id === currentUser._id);

    api.changeLikeCardStatus(card._id, !isLiked)
        .then(newCard => {
          setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
        })
        .catch(err => {
          setErrorMassage(err);
          setIsErrorPopupOpen(true);
        })
  }

  const handleCardDelete = (card) => {
    api.deleteCard(card._id)
        .then(() => {
          setCards((state) => state.filter((c) => c._id === card._id ? c.remove : c))
        })
        .catch(err => {
          setErrorMassage(err);
          setIsErrorPopupOpen(true);
        })
  }

  const handleAddPlaceSubmit = (card) => {
    api.setCard(card)
        .then(newCard => {
          setCards([newCard, ...cards]);
          closeAllPopups();
        })
        .catch(err => {
          setErrorMassage(err);
          setIsErrorPopupOpen(true);
        })
  }

  return (
      <CurrentUserContext.Provider value={currentUser}>
          <Header/>
          <Spinner
              isLoaded={isPageLoaded}
          />
          <Main
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardDeleter={handleDeleterClick}
              onCardClick={handleCardClick}
              cards={cards}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
              isLoaded={isPageLoaded}
          />
          <Footer/>
          <EditProfilePopup
              isOpen={isEditProfilePopupOpen}
              onClose={closeAllPopups}
              onUpdateUser={handleUpdateUser}
          />
          <EditAvatarPopup
              isOpen={isEditAvatarPopupOpen}
              onClose={closeAllPopups}
              onUpdateAvatar={handleUpdateAvatar}
          />
          <AddPlacePopup
              isOpen={isAddPlacePopupOpen}
              onClose={closeAllPopups}
              onAddCard={handleAddPlaceSubmit}
          />
          <ErrorPopup
              isOpen={isErrorPopupOpen}
              onClose={closeAllPopups}
              errorMassage={errorMassage}
              onAccessError={handleErrorAccess}
          />
          <PopupWithForm
              isOpen={isDeleterPopupOpen}
              title={'Вы уверены?'}
              name={'delete'}
              buttonText={'ДА'}
              onClose={closeAllPopups}
          >
            <label htmlFor="card-link-input" className="form__field">
              <input type="url"
                     className="form__input"
                     placeholder="Ссылка на картинку"
                     name="avatar"
                     id="profile-avatar-link-input"
                     required/>
              <span className="form__input-error profile-avatar-link-input-error"/>
            </label>
          </PopupWithForm>
          <ImagePopup
              card={selectedCard}
              onClose={closeAllPopups}
          />
      </CurrentUserContext.Provider>
  );
}

export default App;