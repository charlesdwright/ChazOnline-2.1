# coding=utf-8
import os
import sqlite3 as sql
import logging
logging.basicConfig(level=logging.DEBUG)

from sentiment import get_sentiment
from flask import Flask, render_template
from flask import request

import datetime
import pprint

app = Flask(__name__)

# connect to qa_database.sq (database will be created, if not exist)
con = sql.connect('qa_database.db')
con.execute('CREATE TABLE IF NOT EXISTS tbl_QA (ID INTEGER PRIMARY KEY AUTOINCREMENT,'
            + 'theID TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, question TEXT, answer TEXT, feedback TEXT)')
con.close

@app.route('/')
def hello_whale():
    #return "Whale, Hello there!"
    return render_template("main.html")

#--------- sentiment processing ------
@app.route('/sentiment', methods=['GET', 'POST'])
def sentiment():
    feedback=""

    if request.method == 'GET':
        theInput = request.args.get('input')
        theID = request.args.get('sentId')
    else:
        theInput = request.get_json(force=True)['input']
        theID = request.get_json(force=True)['sentId']

    if not theInput:
        return "No input value found"

    app.logger.info("ID: " + str(theID))

    question=theInput
    answer=get_sentiment(theInput)
    theID=str(theID)


    app.logger.info('Q: ' + question + "; A: " + answer + "; Id: " + theID + "; F: " + feedback)

 # store sentiment input and result in database
    try:
        con = sql.connect('qa_database.db')
        c =  con.cursor() # cursor
        timestamp=datetime.datetime.now()

        app.logger.info(timestamp)

        # insert data
        c.execute("INSERT INTO tbl_QA (theID, timestamp, question, answer, feedback) VALUES (?,?,?,?,?)",
            (theID, timestamp, question, answer, feedback))
        con.commit() # apply changes
        app.logger.info('Insert success -- ID: ' + theID + '; Q: ' + question + "; A: " + answer + "; F: " + feedback)

    except con.Error as err:
        app.logger.info("-------------- error --------------")
        app.logger.info("insert error: " + str(err))

    finally:
        con.close() # close the connection

    return answer

# update entry with confirmed feedback

@app.route('/update', methods=['GET', 'POST'])
def update():

    app.logger.info("request:  " + str(request.args))

    if request.method == 'GET':
        theFeedback = request.args.get('feedback')
        theID = request.args.get('subID')

    else:
        theFeedback = request.get_json(force=True)['feedback']
        theID = request.get_json(force=True)['subID']

    if not theFeedback:
        return "No input value found"

    app.logger.info(request.args.get('feedback') + "   " + str(request.args.get('subID')))

    for i in request.args.keys():
        app.logger.info("req args: " + request.args[i])


    feedback=theFeedback
    theID=str(theID)

    app.logger.info("Id: " + theID + "; F: " + feedback)

 # store feedback in database
    try:
        con = sql.connect('qa_database.db')
        c =  con.cursor() # cursor
        # insert data
        c.execute("UPDATE tbl_QA SET feedback = ? WHERE theID = ?", (feedback, theID))
        con.commit() # apply changes

        app.logger.info("Update success -- ID: " + theID + "; F: " + feedback)


    except con.Error as err:
        app.logger.info("-------------- error --------------")
        app.logger.info("update error: " + str(err))

    finally:
        con.close() # close the connection

    return feedback


#----- end sentiment processing ------

# query db
#@app.route('/question/<int:id>', methods=['GET', 'POST'])
@app.route('/question/', methods=['GET'])
def question():

#    app.logger.info("diffs: " + str(request.args.get('diffs')))
    app.logger.info("diffs: " + str(request.args.get("diffs")))

    if request.method == 'GET':
        # send the form
        # code to read the question from database
        try:
            con = sql.connect('qa_database.db')
            c =  con.cursor() # cursor
            # read question : SQLite index start from 1 (see index.html)

            if(str(request.args.get("diffs"))=="None"):
                query = "Select id, question, answer, feedback, timestamp, theID  FROM tbl_QA ORDER BY timestamp" # where id = {0}".format(id)
            else:
                query = "Select id, timestamp, theID, question, answer, feedback FROM tbl_QA WHERE answer != feedback ORDER BY timestamp" # where id = {0}".format(id)
            c.execute(query)
            result = c.fetchall() # fetch the data from cursor
            con.commit() # apply changes
            print("--------------------- QA Dump ---------------------")

            for row in result:
                print(str(row))

            print("-------------------- End QA Dump ------------------")
            return str(result)

        except con.Error as err: # if error
            app.logger.info("-------------- error --------------")
            app.logger.error( "question error: " + str(err))
        finally:
            con.close() # close the connection

        return str(result)



#     else: # request.method == 'POST':
#         # read and check answers
#         submitted_answer = request.form['answer']
#
#         # code to read the answer from database
#         try:
#             con = sql.connect('qa_database.db')
#             c =  con.cursor() # cursor
#             # read answer : SQLite index start from 1 (see index.html)
#             query = "Select answer FROM tbl_QA where id = {0}".format(id)
#             c.execute(query)
#             correct_answer = c.fetchone()[0] # fetch and store tuple-value (see [0])
#             con.commit() # apply changes
#         except con.Error as err: # if error
#             # then display the error in 'database_error.html' page
#             app.logger.info( err)
# #            return render_template('database_error.html', error=err)
#         finally:
#             con.close() # close the connection

        # if submitted_answer == correct_answer:
        #     return render_template('correct.html');
        # else:
        #     return render_template('sorry.html',
        #         answer = correct_answer,
        #         yourAnswer = submitted_answer
        #     )

#
# @app.route('/')
# def hello_whale():
#     #return "Whale, Hello there!"
#     return render_template("main.html")
#
# @app.route('/blah')
# def blah_yadda():
#     return "Blah blah yadda yadda"
#
# @app.route('/sentiment', methods=['GET', 'POST'])
# def sentiment_back():
#
#     if request.method == 'GET':
#         theinput = request.args.get('input')
#     else:
#         theinput = request.get_json(force=True)['input']
#
#     if not theinput:
#         return "No input value found"
#     return get_sentiment(theinput)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=port)
