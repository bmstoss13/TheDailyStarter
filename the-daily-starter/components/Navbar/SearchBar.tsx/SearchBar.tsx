import {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from "./SearchBar.module.css";
import axios from "axios";
import { searchUsers } from '@/lib/routes/routes';
import { UserSearchResult } from '@/lib/firebase/interfaces';

const SearchBar = () => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
    const [debouncedValue, setDebouncedValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                    `${searchUsers}?q=${debouncedValue}`//all-profiles api endpoint
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
    }, [debouncedValue])

    return(
        <div className={styles.searchbarContainer}>
            <FontAwesomeIcon icon={faSearch}/>
            <input 
                type="text"
                className={styles.textbox}
                placeholder="Search users..."
                value={value}
                onChange={(e)=>
                    setValue(e.target.value)
                }
            />
            {isLoading && <div>Loading...</div>}
            {suggestions.length > 0 && (
                suggestions.map(user => (
                    <ul>
                        <li key={user.uid} className={styles.suggestionsList}>
                            {user.photoURL && <img src={user.photoURL} width={50} height={50} alt={user.username} className={styles.userPhoto} loading="lazy"/>}
                            <span className={styles.usernameText}>{user.username}</span>
                        </li>
                    </ul>
                ))
            )}
            {debouncedValue.length > 0 && !isLoading && suggestions.length === 0 && (
                <div className={styles.noResults}>No users found.</div>
            )}
        </div>

    )
}

export default SearchBar;