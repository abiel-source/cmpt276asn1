// PROGRAM SETTINGS:
const TYPE_MEAN = "MEAN";
const TYPE_WEIGHTED = "WEIGHTED";

var programResult;
var programResultType;
var programRecipient = "";

////////////////////////////////////////////////
// MAIN FUNCTIONS

function calculateWeighted()
{
    try {
        if (validateInputs(TYPE_WEIGHTED))
        {
            var weightInpLst = document.querySelectorAll(".weight input");
            var gradeInpLst = document.querySelectorAll(".grade input");
    
            var weightLst = getListOfWeights(weightInpLst);
            var gradeLst = getListOfGrades(gradeInpLst);
    
            var wN = weightLst.length;
            var gN = gradeLst.length;
            
            var sumWeights = 0;
            var weightedAvg = 0;
    
            if (wN === gN)
            {
                for (let i = 0; i < wN; i++)
                {
                    sumWeights += weightLst[i];
                    weightedAvg += (gradeLst[i] * weightLst[i]);
                }
            }
    
            var res = (weightedAvg / sumWeights);
            document.getElementById("result").innerHTML = res;
            updateSettings(res, TYPE_WEIGHTED);
        }
    }
    catch (e) 
    {
        console.error(e);
        alert(e);
    }
}

function calculateMean()
{
    try {
        if (validateInputs(TYPE_MEAN))
        {
            var gradeInpLst = document.querySelectorAll(".grade input");
            var gradeLst = getListOfGrades(gradeInpLst);
            var n = gradeLst.length;
    
            var accumGrades = 0;
            for (let i = 0; i < n; i++)
            {
                accumGrades += gradeLst[i];
            }
            
            var res = accumGrades / n;
            document.getElementById("result").innerHTML = res;
            updateSettings(res, TYPE_MEAN);

        }
    }
    catch(e)
    {
        console.error(e);
        alert(e);
    }
}

// POST: tracks most recent calculation and whether it was a mean calculation or weighted calculation.
// This is useful data for our hidden email feature.
function updateSettings(programValue, programValueType)
{
    programResult = programValue;
    programResultType = programValueType;
    revealMailAction();
}


////////////////////////////////////////////////
// EVENT HANDLERS

var inpLst = document.querySelectorAll(".grade input");
var pLst = document.querySelectorAll(".percentage p");

for (let i = 0; i < inpLst.length; i++)
{
    inpLst[i].addEventListener("keyup", function(){
        
        var isEmptyPartnerField;
        var input1, input2;

        if (i%2 == 0)   // sub field 1
        {
            isEmptyPartnerField = (inpLst[i+1].value.length == 0);
            if (!isEmptyPartnerField)
            {
                input1 = parseFloat(inpLst[i].value);
                input2 = parseFloat(inpLst[i+1].value);
                pLst[i/2].innerHTML = outputRoundedPercentage(input1, input2);
            }
            
        }
        else    // sub field 2
        {
            isEmptyPartnerField = (inpLst[i-1].value.length == 0);
            if (!isEmptyPartnerField)
            {
                input1 = parseFloat(inpLst[i-1].value);
                input2 = parseFloat(inpLst[i].value);
                pLst[(i-1)/2].innerHTML = outputRoundedPercentage(input1, input2);
            }
        }
    });
}

// POST: given the components of a numeric fraction, returns it's equivalent rounded percentage.
// Note that the return value is of type string.
// PARAM: floating point numerator and floating point denominator of fraction 
function outputRoundedPercentage(numerator, denominator)
{
    var res = (numerator / denominator) * 100   // percentage
    res = Math.round(res * 100) / 100;          // rounded
    res = res.toString() + "%";
    return res;
}


////////////////////////////////////////////////
// EXTRA FEATURE

// POST: once a mean/weighted value is successfully calculated, a hidden button will be displayed with the option
// of emailing some student their grade result. 
function revealMailAction()
{
    document.getElementById("hiddenOption").style.visibility = "visible";
}

// POST: send an email to the desired student with their calculated marks.
function emailResult()
{
    var res = programRecipient;

    if (programRecipient === "")
    {
        res = promptEmail();
        if (res == null) return;
    }

    // always confirm recipient with user: if yes then continue with email program, 
    // if not then prompt again for recipient address to which the operation can be cancelled or continue.
    if (window.confirm("send to this address? " + (programRecipient === "" ? res : programRecipient)))
    {
        programRecipient = res;
    }
    else
    {
        res = promptEmail();
        if (res == null) return;
        programRecipient = res;
    }
    
    var url = "mailto:" + programRecipient + "?subject=Official ";
    url += programResultType;
    url += " Result&body=";
    url += "Your current " + programResultType + " grade is calculated at: ";
    url += programResult.toString() + "\n";
    window.open(url);
}

function promptEmail()
{
    var res = window.prompt("please enter a valid email address:");
    if (res == null || res == "")
    {
        alert("email operation was cancelled");
        return null;
    }
    return res;
}


////////////////////////////////////////////////
// HELPER FUNCTIONS

// POST: returns true iff input is formatted correctly, dependent on the type of operation in place;
// will throw an exception if validation parameter "type" is not listed in program settings.
// PARAM: type is a constant program variable that indicates the type of operation executed by our calculator. 
function validateInputs(type)
{
    if (type == TYPE_MEAN)
    {
        var gradeList = document.querySelectorAll(".grade input");

        // there must be at least 1 grade & no dangling input
        return colHasValueUNROLL2(gradeList)
    }

    else if (type == TYPE_WEIGHTED)
    {
        var weightList = document.querySelectorAll(".weight input");
        var gradeList = document.querySelectorAll(".grade input");

        // there must be at least 1 weight
        if (!colHasValue(weightList))
        {
            alert("please enter at least 1 weighting");
            return false;
        }

        // there must be at least 1 grade & no dangling input
        if (!colHasValueUNROLL2(gradeList))
        {
            return false;
        }

        // weight and grade columns must match
        if (!isDirectMappingKAND2K(weightList, gradeList))
        {
            alert("weighting and grades do not match");
            return false;
        }

        return true;
    }

    throw "DEVELOPER_ERROR::VALIDATION TYPE IS NOT SUPPORTED in function validateInputs()";
}

// POST: returns true iff there is at least 1 row with input field satisfied
// PARAM: inputList is a list of input DOM objects, where each input represents a row.
function colHasValue(inputList)
{
    for (var i = 0; i < inputList.length; i++)
    {
        if (inputList[i].value.length != 0)
        {
            return true;
        }
    }
    return false;
}

// POST: returns true iff there is at least 1 row with BOTH input fields satisfied
// and no field pair left "dangling" (that is 1 field with entry & 1 field without entry)
// PARAM: inputList is a list of input DOM objects, where each consecutive pair of input fields represents a row.
function colHasValueUNROLL2(inputList)
{
    // linear optimize: loop unroll by factor 2
    var hasAtLeastOne = false;

    for (var i = 0; i < inputList.length; i+=2)
    {
        var isEmptySubField1 = inputList[i].value.length == 0;
        var isEmptySubField2 = inputList[i+1].value.length == 0;

        var isEmptyPair = isEmptySubField1 || isEmptySubField2;
        if (!isEmptyPair)
        {
            hasAtLeastOne = true;
        }

        if (isEmptySubField1 && !isEmptySubField2)
        {
            alert("please enter grade numerator");
            return false;
        }

        if (!isEmptySubField1 && isEmptySubField2)
        {
            alert("please enter grade denominator");
            return false;
        }
    }

    if (!hasAtLeastOne)
    {
        alert("please enter at least 1 grade");
    }
    return hasAtLeastOne;
}

// POST: returns true iff there is a one-to-one mapping between the elements of both given lists
// PARAM:inpLst1 is an array with k elements and inpLst2 is an array with 2k elements
// 
// algorithm: 
//      constraint = inpLst1[i] should be non-empty iff inpLst2[i*2] AND inpLst2[i*2 + 1] is non-empty
//      check this constraint for each i=0, while i<inpLst1.length
//  
function isDirectMappingKAND2K(inpLst1, inpLst2)
{
    var K = inpLst1.length;
    var twoK = inpLst2.length;
    if (2*K == twoK) // should always be true in calculator.html
    {
        for (var i = 0; i < K; i++)
        {
            var inp1Empty = (inpLst1[i].value.length == 0);
            var inp2Empty = (inpLst2[i*2].value.length == 0) || (inpLst2[i*2 + 1].value.length == 0);

            if (!inp1Empty && inp2Empty)
            {
                return false;
            }
            if (inp1Empty && !inp2Empty)
            {
                return false;
            }
        }
    }

    return true;
}

// POST: returns an array of floating-point weight values from the given input fields
// PARAM: weightInpLst is an array of inputs, where each input represents a row in the "weight" column
function getListOfWeights(weightInpLst)
{
    var res = [];
    for (let i = 0; i < weightInpLst.length; i++)
    {
        if (weightInpLst[i].value.length != 0)
        {
            let floatVal = parseFloat(weightInpLst[i].value);
            res.push(floatVal);
        }

    }
    return res;
}

// POST: returns an array of floating-point grade values from the given input fields. Each grade value is the quotient
// of each field-pair in gradeInpLst. 
// Assert: the returned array is half the size of gradeInpLst.
// PARAM: gradeInpLst is an array of inputs, where each consecutive pair of inputs represents a row in the "grade" column
function getListOfGrades(gradeInpLst)
{
    var res = [];
    for (let i = 0; i < gradeInpLst.length; i+=2)
    {
        if (gradeInpLst[i].value.length != 0 && gradeInpLst[i+1].value.length != 0)
        {
            let numer = parseFloat(gradeInpLst[i].value);
            let denom = parseFloat(gradeInpLst[i+1].value);
            let quotient = numer / denom;
            res.push(quotient);
        }
    }
    return res;
}