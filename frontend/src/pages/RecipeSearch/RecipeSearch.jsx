import React, { useRef, useState, useEffect } from "react";
import { StyledRecipeSearch } from "./RecipeSearch.styles";
import axios from "axios";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import { CombinedRecipeData } from "./CombinedRecipeData";

// import searchSample from "../../recipeSearchSample";
// import bulkSample from "../../recipeBulkInfoSample";

export default function RecipeSearch() {
    // State for Ingredient

    const [ingredients, setIngredients] = useState("");
    const [recipeList, setRecipeList] = useState([]);
    const [filter, setFilter] = useState(null);
    const [error, setError] = useState(false);

    // List of Ingredients
    const ingredientRef = useRef("");

    async function handleSubmit() {
        try {
            const result = await axios.get(
                "http://localhost:4000/api/searchbyingredient",
                {
                    params: {
                        ingredients: ingredients,
                    },
                }
            );

            console.log(result);
            if (result?.data) {
                setError(false);
            }

            //used for bulk info api call
            const recipeIdList = result.data.map((recipe) => recipe.id);

            const recipeInstructions = await axios.get(
                "http://localhost:4000/api/recipeinformation",
                {
                    params: {
                        recipeIdList: recipeIdList,
                    },
                }
            );

            //combining both api calls data
            let combined = CombinedRecipeData(
                result.data,
                recipeInstructions.data
            );

            console.log("combined", combined);
            ///Filter operation on recipes
            let filteredRecipes = filterRecipeList(combined, filter);

            setRecipeList(filteredRecipes);
        } catch (err) {
            console.log(err);
            setError(true);
        }
    }

    return (
        <StyledRecipeSearch>
            <div className="title">
                <h1>Recipe Search</h1>
            </div>
            <div className="search">
                <form
                    action="#"
                    onSubmit={() => {
                        handleSubmit();
                    }}>
                    <input
                        ref={ingredientRef}
                        onChange={(event) => setIngredients(event.target.value)}
                        id="ingregients"
                        value={ingredients}
                        type="text"
                        placeholder="What are you in the mood for?"
                    />
                    <button>Search</button>
                </form>
            </div>

            <div>{ingredients}</div>

            <div className="filter">
                <h2>Filters</h2>
                <Filter recipeListArr={recipeList} />
            </div>

            <div className="searchResults">
                {recipeList.length > 0 ? (
                    recipeList.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))
                ) : error ? (
                    <h3> An error has occured, please try searching again. </h3>
                ) : (
                    <h3> Search for Ingredients to show Recipe Results. </h3>
                )}
            </div>
        </StyledRecipeSearch>
    );
}

//todo filter recipes by id allowed
function filterRecipeList(recipeListArr, filter) {
    //todo implement filters and return new recipe list according to filters

    if (!filter || !filter.diets || filter.otherOptions) {
        console.log("no filters");
        return recipeListArr;
    }

    const filteredList = recipeListArr.filter((recipe) => {
        if (filter.includes(recipe.id)) {
            console.log("recipe : ", recipe.id, "passed");
            return true;
        }

        console.log("recipe : ", recipe.id, "failed");
        return false;
    });

    return filteredList;
}

//=====================================
//FILTER COMPONENT
//
function Filter({ recipeListArr }) {
    //todo props what filters do i display extract that to its own funciton
    if (!recipeListArr) {
        return <div>no filters available</div>;
    }
    let dietOptions = new Set();
    let otherOptionsAvailable = new Set();

    let otherOptions = [
        "cheap",
        "dairyFree",
        "glutenFree",
        "vegan",
        "vegetarian",
        "veryPopular",
        "veryHealthy",
    ];

    //check recipe list and add all recipes diets filters the text string one
    recipeListArr.forEach((recipe) => {
        //extract diets from recipe
        let dietArr = recipe.diets;
        if (dietArr.length > 0) {
            dietArr.forEach((categoryStr) => {
                dietOptions.add(categoryStr);
            });
        }

        //extract other options from recipe the BOOLEANs
        otherOptions.forEach((item) => {
            if (recipe[item]) otherOptionsAvailable.add(item);
        });
    });

    //all diet options and other options extracted from recipe list
    let dietOptionsArr = Array.from(dietOptions.values());
    let otherOptionsAvailableArr = Array.from(otherOptionsAvailable.values());

    return (
        <>
            <h2>Dietary options</h2>
            <section>
                {dietOptionsArr.length > 0 ? (
                    <ul className="filter-options">
                        {dietOptionsArr.map((item, index) => {
                            return (
                                <li className="btn" key={index + item}>
                                    <span>{item}</span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <></>
                )}
            </section>
            <section>
                <h2>other options</h2>
                <ul className="filter-options">
                    {otherOptionsAvailableArr.map((option, index) => {
                        return (
                            <li key={option + index} className="btn">
                                <span>{option}</span>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
}
