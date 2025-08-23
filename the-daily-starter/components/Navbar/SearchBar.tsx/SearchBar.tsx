import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from "./SearchBar.module.css";
import axios from "axios";
import { searchUsers } from '@/lib/routes/routes';
import { UserSearchResult } from '@/lib/firebase/interfaces';
import defaultProf from '@/public/png-transparent-default-avatar.png'
import Image from 'next/image';

const SearchBar = () => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
    const [debouncedValue, setDebouncedValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(false); // New state to track if the search bar is active

    const searchbarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [value]);

    useEffect(() => {
        if(debouncedValue.trim() === ''){
            setSuggestions([]);
            return;
        }

        const fetchData = async() => {
            setIsLoading(true);
            try{
                const query = debouncedValue.toLowerCase();
                const { data } = await axios.get(
                    `${searchUsers}?q=${debouncedValue}`
                );

                if(Array.isArray(data)){
                    setSuggestions(data);
                } else {
                    console.warn('API response was not an array: ', data);
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("An error occurred while searching users: ", err);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [debouncedValue]);


useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchbarRef.current && !searchbarRef.current.contains(event.target as Node)) {
            setIsActive(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, []);


    return (
        <div className={styles.searchWrapper} ref={searchbarRef}>
            <div 
                className={`${styles.searchbarContainer} ${isActive ? styles.active : ''}`}
                onClick={() => setIsActive(true)}
                >
                <FontAwesomeIcon icon={faSearch} />
                <input 
                    type="text"
                    className={`${styles.textbox} ${isActive ? styles.active : ''}`}
                    placeholder="Search users..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setIsActive(true)}
                />
            </div>

            {/* Dropdown suggestions */}
            {isActive && (
            <div className={styles.suggestionsDropdown}>
                {isLoading && <div className={styles.loading}>Loading...</div>}
                {suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                    {suggestions.map(user => (
                    <li key={user.uid} className={styles.suggestionItem}>
                        {user.photoURL ? (
                        <img 
                            src={user.photoURL}
                            width={40} height={40} 
                            alt={user.username} 
                            className={styles.userPhoto} 
                            loading="lazy"
                        />
                        ) : (
                        <Image 
                            src={defaultProf}
                            width={40} height={40} 
                            alt={user.username} 
                            className={styles.userPhoto} 
                            loading="lazy"
                        />
                        )}
                        <span className={styles.usernameText}>{user.username}</span>
                    </li>
                    ))}
                </ul>
                )}
                {debouncedValue.length > 0 && !isLoading && suggestions.length === 0 && (
                <div className={styles.noResults}>No users found.</div>
                )}
            </div>
            )}
        </div>
    );

};

export default SearchBar;