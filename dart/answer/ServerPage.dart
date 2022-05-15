import 'package:answer/api/NetWork.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';

int start = 0;
String code = "加載中...";
String alert = "";

class ServerPage extends StatefulWidget {
  const ServerPage({Key? key}) : super(key: key);

  @override
  _ServerPage createState() => _ServerPage();
}

class _ServerPage extends State<ServerPage> {
  late List<Widget> _children = <Widget>[];
  late int _number = 5;
  late bool _num = false;
  late bool _button = true;

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance!.addPostFrameCallback((_) async {
      if (start == 0) {
        start = 1;
        var data = await NetWork('{"Type":"create"}');
        code = data["response"];
        while (true) {
          await Future.delayed(const Duration(seconds: 1));
          var data = await NetWork('{"Type":"check","Code":"$code"}');
          if (data["response"] != null) {
            int time = 0;
            _children = <Widget>[];
            for (var i = 0; i < data["response"].length; i++) {
              if (time == 0) {
                time = data["response"][i]["time"];
              }
              _children.add(Text(
                  (i+1).toString()+" - "+
                data["response"][i]["name"] +
                    " - 時間(ms): " +
                    (data["response"][i]["time"] - time).toString() ,
                style: const TextStyle(
                  fontSize: 25,
                  fontWeight: FontWeight.normal,
                ),
                textAlign: TextAlign.center,
              ));
              time = data["response"][i]["time"];
            }
          }
          setState(() {});
        }
      }
    });
    return Scaffold(
      appBar: AppBar(
        title: Text("房間號: " + code),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Visibility(
            visible: _num,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _number.toString(),
                  style: const TextStyle(
                    fontWeight: FontWeight.normal,
                    fontSize: 80,
                  ),
                ),
                const Text(
                  "數字消失後即可搶答",
                  style: TextStyle(
                    fontWeight: FontWeight.normal,
                    fontSize: 50,
                  ),
                ),
              ],
            ),
          ),
          ListView(
            shrinkWrap: true,
            padding: const EdgeInsets.all(20.0),
            children: _children,
          ),
          const SizedBox(
            width: double.infinity,
          ),
          Visibility(
            visible: _button,
            child: CupertinoButton(
              color: Colors.purple,
              child: const Text("開始"),
              onPressed: () async {
                _num = true;
                _button=false;
                _number = 5;
                for (var i = 0; i < 5; i++) {
                  await Future.delayed(const Duration(seconds: 1));
                  _number--;
                }
                var data = await NetWork('{"Type":"clear","Code":"$code"}');
                _num = false;
                _button=true;
                if (data["response"] == null) {
                  alert = "發生錯誤 請刷新頁面";
                  showAlert(context);
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}

Future<bool?> showAlert(BuildContext context) {
  return showDialog<bool>(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: const Text('通知!'),
        content: Text(alert),
        actions: <Widget>[
          TextButton(
            child: const Text('知道了'),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      );
    },
  );
}
